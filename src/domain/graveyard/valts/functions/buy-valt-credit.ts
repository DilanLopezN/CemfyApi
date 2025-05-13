import { Prisma, PrismaClient } from '@prisma/client';
import { BuyValtDto } from '../dto/create-valt.dto';
import { randomUUID } from 'node:crypto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { CreditService } from 'src/domain/payments/credit/credit.service';
import verifyPromotions from './verify-promotions';
import { DiscountService } from './discount-service';
import { makeManagementService } from 'src/core/factories/make.financial.service';
const prisma = new PrismaClient();
const creditService = new CreditService();

export async function buyValtCredit(
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType & {
    Squares: { Graveyards: { id: string } };
  },
  buyValtDto: BuyValtDto,
) {
  const ownerData = await prisma.valtOwners.findUnique({
    where: {
      valtsId: valt.id,
    },
  });

  if (!ownerData) {
    throw new GenericThrow('Esse jazigo não possui um proprietário associado');
  }

  const managementService = await makeManagementService();
  const activeFinancialManagement =
    await managementService.getActiveFinancialManagement();

  if (!activeFinancialManagement)
    throw new GenericThrow('Tabela de configuração financeira não encontrada');
  try {
    const promotion = await verifyPromotions(
      valt.valtTypeId,
      valt.Squares?.Graveyards?.id,
      buyValtDto.items?.map((item) => item.id || ''),
    );

    const saleValue =
      typeof assignee.saleValue === 'number' && assignee.saleValue > 0
        ? promotion.hasPromotion
          ? assignee.saleValue * (1 - promotion.discount / 100)
          : assignee.saleValue
        : promotion.hasPromotion
        ? valt.saleValue * (1 - promotion.discount / 100)
        : valt.saleValue;

    const installment = await prisma.$transaction(
      async (prisma) => {
        const chargeId = `C${assignee.id}V${valt.id}-${randomUUID()}`;

        const items = buyValtDto.items
          ? [
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
            ]
          : [
              {
                amount: 1,
                name: 'Cobrança jazigo',
                value: saleValue,
              },
            ];

        const installment = await creditService
          .create({
            customId: chargeId,
            installmentQuantity: Number(buyValtDto.installmentQuantity),
            items,
            payment: {
              discountValue: buyValtDto.discountValue,
              credit_card: {
                customer: {
                  cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
                  email: assignee.email,
                  name: assignee.name,
                  phone_number: assignee.phone.replace(/[^\d]/g, ''),
                },
                installments: Number(buyValtDto.installmentQuantity),
                payment_token: buyValtDto.creditToken,
              },
            },
            installment: buyValtDto.installment,
          })
          .catch((err) => {
            throw err;
          });

        const owner = await prisma.valtOwners
          .update({
            where: { id: ownerData.id },
            data: {
              chargeId: chargeId,
              status: 'AGUARDANDO_PAGAMENTO',
              amountValue: saleValue,
              serviceType: 'VENDA',
              transactionType: 'CHARGE',
              amountInstallments: Number(buyValtDto.installmentQuantity),
              assignee: {
                connect: { id: assignee.id },
              },
              valt: {
                connect: {
                  id: valt.id,
                },
              },
              payment: {
                create: {
                  financialManagementId: activeFinancialManagement.id ?? null,
                  assigneeId: assignee.id,
                  chargeId: chargeId,
                  method: 'CREDITO',
                  serviceType: 'VENDA',
                  values: saleValue,
                },
              },
            },
          })
          .catch((err) => {
            throw err;
          });

        if (!installment) return;

        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: installment.data.charge_id.toString(),
            status:
              installment.data.status == 'aproved'
                ? 'PAGO_TOTAL'
                : 'AGUARDANDO_PAGAMENTO',
            type: 'CREDITO',
            expireDate: new Date(Date.now()),
            paymentLink: 'COMPRA POR CRÉDITO APROVADA SEM LINK PARA PAGAMENTO',
            pdfLink: 'COMPRA POR CRÉDITO APROVADA SEM PDF PARA PAGAMENTO',
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
        return installment;
      },
      {
        timeout: 10000 * 120,
      },
    );
    return installment;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
