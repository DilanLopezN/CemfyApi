import { Injectable } from '@nestjs/common';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import PaymentServices from '../payment';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { env } from 'src/core/env';
import { makeManagementService } from 'src/core/factories/make.financial.service';

@Injectable()
export class CreditService {
  private efiService = new PaymentServices();

  async create(createCreditDto: CreateCreditDto) {
    this.efiService.setUseCertificate(false);
    try {
      const managementService = await makeManagementService();
      const activeFinancialManagement =
        await managementService.getActiveFinancialManagement();

      if (activeFinancialManagement != null) {
        if (
          !activeFinancialManagement.allowed_payment_methods.includes('CREDITO')
        ) {
          throw new Error(
            'METODO DE PAGAMENTO NÃO PERMITIDO NA CONFIGURAÇÃO ATUAL',
          );
        }
      }

      if (createCreditDto.installment) {
        if (
          createCreditDto.installmentQuantity >
            activeFinancialManagement.max_installments ||
          createCreditDto.installmentQuantity <
            activeFinancialManagement.min_installments
        )
          throw new GenericThrow(
            'Numero de parcelas fora da regra configurada',
          );

        if (createCreditDto.installmentQuantity > 36)
          throw new GenericThrow('Máximo de 36 parcelas');

        const response =
          await this.efiService.paymentService.createOneStepCharge(
            {},
            {
              metadata: {
                notification_url: `${env.CHARGES_HOOK_URL}/charge`,
                custom_id: createCreditDto.customId,
              },
              items: createCreditDto.items,
              payment: {
                credit_card: {
                  discount: createCreditDto.payment.discountValue
                    ? {
                        type: 'percentage',
                        value: createCreditDto.payment.discountValue * 100,
                      }
                    : undefined,
                  payment_token:
                    createCreditDto.payment.credit_card.payment_token,
                  installments:
                    createCreditDto.payment.credit_card.installments,
                  customer: createCreditDto.payment.credit_card.customer,
                  billing_address: {
                    street: 'Street 3',
                    number: '10',
                    neighborhood: 'Bauxita',
                    zipcode: '35400000',
                    city: 'Ouro Preto',
                    state: 'MG',
                  },
                },
              },
            },
          );

        return response;
      }

      const response = await this.efiService.paymentService.createOneStepCharge(
        {},
        {
          metadata: {
            notification_url: `${env.CHARGES_HOOK_URL}/charge`,
            custom_id: createCreditDto.customId,
          },
          items: createCreditDto.items,
          payment: {
            credit_card: {
              discount: createCreditDto.payment.discountValue
                ? {
                    type: 'percentage',
                    value: createCreditDto.payment.discountValue * 100,
                  }
                : undefined,
              payment_token: createCreditDto.payment.credit_card.payment_token,
              installments: createCreditDto.payment.credit_card.installments,
              customer: createCreditDto.payment.credit_card.customer,
              billing_address: {
                street: 'Street 3',
                number: '10',
                neighborhood: 'Bauxita',
                zipcode: '35400000',
                city: 'Ouro Preto',
                state: 'MG',
              },
            },
          },
        },
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
}
