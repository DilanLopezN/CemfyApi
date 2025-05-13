import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFleshDto } from './dto/create-flesh.dto';
import PaymentServices from '../payment';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { env } from 'src/core/env';
import { makeManagementService } from 'src/core/factories/make.financial.service';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Injectable()
export class FleshService {
  private readonly efiService = new PaymentServices();
  private readonly logger = new Logger(FleshService.name);

  /**
   * Cria carnês de pagamento com base nas configurações fornecidas
   * @param fleshDto Dados para criação dos carnês
   * @returns Todos carnês, conforme data de vencimento mês a mês, máximo 36 carnês (3 anos)
   * @author Dilan Lopez
   */
  async create_flesh(fleshDto: CreateFleshDto) {
    try {
      this.efiService.setUseCertificate(false);

      const managementService = await makeManagementService();
      const activeFinancialManagement =
        managementService.getActiveFinancialManagement();

      // Validações iniciais
      this.validateInstallments(fleshDto.repeats, activeFinancialManagement);

      return fleshDto.repeats >= 25
        ? await this.createExtendedCarnet(fleshDto, activeFinancialManagement)
        : await this.createStandardCarnet(fleshDto, activeFinancialManagement);
    } catch (error) {
      this.handleErrors(error, fleshDto);
    }
  }

  /**
   * Valida o número de parcelas de acordo com as regras de negócio
   */
  private validateInstallments(
    repeats: number,
    activeFinancialManagement: any,
  ): void {
    const minInstallments = activeFinancialManagement?.min_installments ?? 1;
    const maxInstallments = activeFinancialManagement?.max_installments ?? 12;

    if (repeats > maxInstallments || repeats < minInstallments) {
      throw new BadRequestException(
        'Número de parcelas fora da regra configurada',
      );
    }

    if (repeats > 36) {
      throw new BadRequestException('Máximo de 36 carnês permitido');
    }
  }

  /**
   * Cria carnês estendidos quando o número de parcelas é maior ou igual a 25
   */
  private async createExtendedCarnet(
    fleshDto: CreateFleshDto,
    activeFinancialManagement: any,
  ) {
    const interestRate = Number(activeFinancialManagement.interest_rate) * 10;

    // Configurações comuns para criação de carnês
    const commonConfig = {
      customer: fleshDto.customer,
      items: fleshDto.items,
      discount: fleshDto.discountValue
        ? { type: 'percentage' as const, value: fleshDto.discountValue * 100 }
        : undefined,
      configurations: {
        interest: { type: 'monthly' as const, value: interestRate },
      },
    };

    // Cria o primeiro conjunto de carnês (24 parcelas)
    const firstCarnetResponse =
      await this.efiService.paymentService.createCarnet(
        {},
        {
          ...commonConfig,
          metadata: {
            notification_url: `${env.CHARGES_HOOK_URL}/charge`,
            custom_id: fleshDto.customId,
          },
          expire_at: fleshDto.expire_at,
          repeats: 24,
        },
      );

    // Calcula a data para o segundo conjunto de carnês
    const lastAmountBilling =
      firstCarnetResponse.data.charges[
        firstCarnetResponse.data.charges.length - 1
      ].expire_at;
    const referenceDate = new Date(lastAmountBilling);
    referenceDate.setMonth(referenceDate.getMonth() + 1);
    const newExpiresDate = referenceDate.toISOString().split('T')[0];

    // Cria o segundo conjunto de carnês
    const secondCarnetResponse =
      await this.efiService.paymentService.createCarnet(
        {},
        {
          ...commonConfig,
          expire_at: newExpiresDate,
          repeats: fleshDto.repeats - 24,
        },
      );

    // Combina os resultados dos dois conjuntos
    const totalCharges = firstCarnetResponse.data.charges.concat(
      secondCarnetResponse.data.charges,
    );

    return {
      firstFleshId: firstCarnetResponse.data.carnet_id,
      firstFleshStatus: firstCarnetResponse.data.status,
      firstFleshPdf: firstCarnetResponse.data.pdf.carnet,
      lastFleshStatus: secondCarnetResponse.data.status,
      lastFleshId: secondCarnetResponse.data.carnet_id,
      lastFleshPdf: secondCarnetResponse.data.pdf.carnet,
      charges: this.formatCharges(totalCharges),
    };
  }

  /**
   * Cria carnês padrão quando o número de parcelas é menor que 25
   */
  private async createStandardCarnet(
    fleshDto: CreateFleshDto,
    activeFinancialManagement: any,
  ) {
    const interestRate =
      Number(activeFinancialManagement?.interest_rate ?? 1) * 10;

    // Dividir valor por parcela
    const itemsWithSplitValues = fleshDto.items.map((item) => ({
      name: item.name,
      value: Number(item.value) / Number(fleshDto.repeats),
      amount: item.amount,
    }));

    const { data } = await this.efiService.paymentService.createCarnet(
      {},
      {
        metadata: {
          notification_url: `${env.CHARGES_HOOK_URL}/charge`,
          custom_id: fleshDto.customId,
        },
        customer: fleshDto.customer,
        expire_at: fleshDto.expire_at,
        discount: fleshDto.discountValue
          ? { type: 'percentage', value: fleshDto.discountValue * 100 }
          : undefined,
        items: itemsWithSplitValues,
        repeats: fleshDto.repeats ?? 1,
        configurations: {
          interest: { type: 'monthly' as const, value: interestRate },
        },
      },
    );

    return {
      firstFleshId: data.carnet_id,
      firstFleshStatus: data.status,
      firstFleshPdf: data.pdf.carnet,
      lastFleshStatus: data.status,
      lastFleshId: data.carnet_id,
      lastFleshPdf: data.pdf.carnet,
      charges: this.formatCharges(data.charges),
    };
  }

  /**
   * Formata as cobranças para padronizar a resposta
   */
  private formatCharges(charges: any[]) {
    return charges.map((charge, index) => ({
      id: charge.charge_id,
      status: charge.status,
      parcelNumber: index + 1,
      expiresAt: charge.expire_at,
      barcode: charge.barcode,
      pixCopy: charge.pix?.qrcode,
      pdf: charge.pdf.charge,
      parcelLink: charge.parcel_link,
    }));
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleErrors(error: any, dto: CreateFleshDto): never {
    this.logger.error(`Erro ao processar carnê: ${error.message}`, {
      error,
      dto: { ...dto, customer: { id: dto.customer?.cpf } }, // Log seguro, sem dados sensíveis
    });

    // Tratamento específico para erros do Prisma
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint failed
          throw new BadRequestException(
            'Registro duplicado encontrado no banco de dados',
          );
        case 'P2025': // Record not found
          throw new BadRequestException(
            'Registro não encontrado no banco de dados',
          );
        case 'P2003': // Foreign key constraint failed
          throw new BadRequestException(
            'Relacionamento inválido entre registros',
          );
        default:
          throw new BadRequestException(
            `Erro do banco de dados: ${error.message}`,
          );
      }
    }

    if (error instanceof PrismaClientValidationError) {
      throw new BadRequestException(
        'Dados inválidos para operação no banco de dados',
      );
    }

    // Tratamento para erros da API de pagamento
    if (error.response?.data?.errors) {
      const apiErrors = error.response.data.errors.join(', ');
      throw new BadRequestException(
        `Erro no serviço de pagamento: ${apiErrors}`,
      );
    }

    // Mantém erros já tratados
    if (error instanceof BadRequestException || error instanceof GenericThrow) {
      throw error;
    }

    // Fallback para erros não tratados
    throw new InternalServerErrorException(
      'Erro interno ao processar carnês de pagamento',
    );
  }
}
