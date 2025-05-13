import { Prisma, PrismaClient } from '@prisma/client';
import { BuyValtDto } from '../dto/create-valt.dto';
import { BilletService } from 'src/domain/payments/billet/billet.service';
import { randomUUID } from 'node:crypto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import verifyPromotions from './verify-promotions';
import { DiscountService } from './discount-service';
import { makeManagementService } from 'src/core/factories/make.financial.service';
import { RabbitService } from 'src/core/rabbitmq/rabbit.service';

/**
 * Serviço para processar a compra de um Valt através de boleto bancário
 *
 * @param assignee - Dados do comprador/cessionário
 * @param valt - Dados do jazigo (valt) a ser comprado
 * @param buyValtDto - Dados para a criação do boleto
 * @returns Objeto contendo os dados dos boletos gerados
 * @throws GenericThrow em caso de falha na geração dos boletos
 * @author Dilan Lopez
 */
export async function buyValtBillet(
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType & {
    Squares: { Graveyards: { id: string } };
  },
  buyValtDto: BuyValtDto,
) {
  const prisma = new PrismaClient();
  const billetService = new BilletService();

  try {
    return await prisma.$transaction(
      async (tx) => {
        const ownerData = await prisma.valtOwners.findUnique({
          where: {
            valtsId: valt.id,
          },
        });

        if (!ownerData) {
          throw new GenericThrow(
            'Esse jazigo não possui um proprietário associado',
          );
        }

        const managementService = await makeManagementService();
        const activeFinancialManagement =
          await managementService.getActiveFinancialManagement();

        if (!activeFinancialManagement)
          throw new GenericThrow(
            'Tabela de configuração financeira não encontrada',
          );

        const chargeId = `C${assignee.id}V${valt.id}-${randomUUID()}`;

        const promotion = await verifyPromotions(
          valt.valtTypeId,
          valt.Squares?.Graveyards?.id,
          buyValtDto.items.map((item) => item.id || ''),
        );

        const saleValue =
          typeof assignee.saleValue === 'number' && assignee.saleValue > 0
            ? promotion.hasPromotion
              ? assignee.saleValue * (1 - promotion.discount / 100)
              : assignee.saleValue
            : promotion.hasPromotion
            ? valt.saleValue * (1 - promotion.discount / 100)
            : valt.saleValue;

        const customerInfo = {
          birth: new Date(assignee.birthdate).toISOString().split('T')[0],
          cpf: assignee?.cpf?.replace(/[\.\-\s]/g, ''),
          email: assignee.email,
          name: assignee.name,
          phone_number: assignee?.phone?.replace(/[^\d]/g, ''),
        };

        const items = [
          {
            amount: 1,
            name: 'Cobrança jazigo',
            value: saleValue * 100,
          },
          ...buyValtDto.items.map((item) => {
            const discountedValue = DiscountService(promotion, {
              id: item.id,
              value: item.value,
            });

            return {
              amount: item.amount,
              name: item.name,
              value: (discountedValue ?? item.value) * 100,
            };
          }),
        ];

        const billets = await billetService.create({
          customId: chargeId,
          installmentQuantity: buyValtDto.installmentQuantity,
          installment: buyValtDto.installment,
          items,
          payment: {
            banking_billet: {
              discountValue: buyValtDto.discountValue,
              expire_at: new Date(buyValtDto.expireDate)
                .toISOString()
                .split('T')[0],
              customer: customerInfo,
            },
          },
        });

        if (!billets) throw new GenericThrow('Falha ao gerar boletos');

        const owner = await tx.valtOwners.update({
          where: {
            id: ownerData.id,
          },
          data: {
            chargeId,
            status: 'AGUARDANDO_PAGAMENTO',
            amountValue: saleValue,
            serviceType: 'VENDA',
            transactionType: 'CHARGE',
            amountInstallments: Number(buyValtDto.installmentQuantity),
            assignee: { connect: { id: assignee.id } },
            valt: { connect: { id: valt.id } },
            payment: {
              create: {
                financialManagementId: activeFinancialManagement.id ?? null,
                assigneeId: assignee.id,
                chargeId,
                method: 'BOLETO',
                serviceType: 'VENDA',
                values: saleValue,
              },
            },
          },
        });

        const billetArray = Array.isArray(billets) ? billets : [billets];

        const paymentsPromises = billetArray.map((billet) =>
          tx.paymentsGenerated.create({
            data: {
              assigneeId: assignee.id,
              chargeId: billet.chargeId.toString(),
              status: 'AGUARDANDO_PAGAMENTO',
              type: 'BOLETO',
              expireDate: new Date(billet.expireDate),
              paymentLink: billet.paymentLink,
              pdfLink: billet.pdfLink,
              ValtOwners: { connect: { id: owner.id } },
            },
          }),
        );

        await Promise.all(paymentsPromises);

        return billets;
      },
      {
        timeout: 10000 * 180, // 3 minutos
      },
    );
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
