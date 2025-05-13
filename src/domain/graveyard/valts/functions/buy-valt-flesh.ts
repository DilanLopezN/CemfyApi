import { Prisma, PrismaClient } from '@prisma/client';
import { BuyValtDto } from '../dto/create-valt.dto';
import { randomUUID } from 'node:crypto';
import { FleshService } from 'src/domain/payments/flesh/flesh.service';
import verifyPromotions from './verify-promotions';
import { DiscountService } from './discount-service';
import { makeManagementService } from 'src/core/factories/make.financial.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';

const prisma = new PrismaClient();
const fleshService = new FleshService();

export async function buyValtFlesh(
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
    const itemIds = buyValtDto.items.map((item) => item.id || '');
    const promotion = await verifyPromotions(
      valt.valtTypeId,
      valt.Squares?.Graveyards?.id,
      itemIds,
    );

    const hasValidAssigneeSaleValue =
      typeof assignee.saleValue === 'number' && assignee.saleValue > 0;
    const baseValue = hasValidAssigneeSaleValue
      ? assignee.saleValue
      : valt.saleValue;
    const saleValue = promotion.hasPromotion
      ? baseValue * (1 - promotion.discount / 100)
      : baseValue;

    const chargeId = `C${assignee.id}V${valt.id}-${randomUUID()}`;

    const customerData = {
      birth: new Date(assignee.birthdate).toISOString().split('T')[0],
      cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
      email: assignee.email,
      name: assignee.name,
      phone_number: assignee.phone.replace(/[^\d]/g, ''),
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

    const expireAtFormatted = new Date(buyValtDto.expireDate)
      .toISOString()
      .split('T')[0];

    return await prisma.$transaction(
      async (tx) => {
        const carnets = await fleshService
          .create_flesh({
            customId: chargeId,
            split_items: false,
            discountValue: buyValtDto.discountValue,
            repeats: buyValtDto.installmentQuantity ?? 1,
            items: items,
            expire_at: expireAtFormatted,
            customer: customerData,
          })
          .catch((err) => {
            console.error('Erro ao criar flesh:', err);
            throw err;
          });

        const owner = await tx.valtOwners.update({
          where: {
            id: ownerData.id,
          },
          data: {
            chargeId,
            status: 'AGUARDANDO_PAGAMENTO',
            amountValue: saleValue,
            serviceType: 'VENDA',
            transactionType: 'CARNET',
            amountInstallments: Number(buyValtDto.installmentQuantity),
            assignee: { connect: { id: assignee.id } },
            valt: { connect: { id: valt.id } },
            payment: {
              create: {
                financialManagementId: activeFinancialManagement.id ?? null,
                assigneeId: assignee.id,
                chargeId,
                method: 'CARNE',
                serviceType: 'VENDA',
                values: saleValue,
              },
            },
          },
        });

        await Promise.all(
          carnets.charges.map((carnet) =>
            tx.paymentsGenerated.create({
              data: {
                assigneeId: assignee.id,
                chargeId: carnet.id.toString(),
                status: 'AGUARDANDO_PAGAMENTO',
                type: 'CARNE',
                expireDate: new Date(carnet.expiresAt),
                paymentLink: carnet.parcelLink,
                pdfLink: carnet.pdf,
                ValtOwners: { connect: { id: owner.id } },
              },
            }),
          ),
        );

        return carnets;
      },
      {
        timeout: 10000 * 120,
      },
    );
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
