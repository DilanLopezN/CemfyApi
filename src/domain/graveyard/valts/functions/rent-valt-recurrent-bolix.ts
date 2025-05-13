import { Prisma, PrismaClient } from '@prisma/client';
import { BuyValtDto } from '../dto/create-valt.dto';
import { BilletService } from 'src/domain/payments/billet/billet.service';
import { randomUUID } from 'node:crypto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import verifyPromotions from './verify-promotions';
import { DiscountService } from './discount-service';
import { RecurrenceService } from 'src/domain/payments/recurrence/recurrence.service';

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
export async function rentValtBolix(
  assignee: Prisma.AssigneeMaxAggregateOutputType & {
    address: {
      id: number;
      city: string | null;
      state: string | null;
      neighborhood: string | null;
      address_name: string | null;
      zipcode: string | null;
    };
    payment: {
      id: number;
      status: boolean | null;
      dueDay: string;
      dueDate: string;
      assinado: boolean | null;
    };
  },
  valt: Prisma.ValtsMaxAggregateOutputType & {
    Squares: { Graveyards: { id: string } };
  },
  buyValtDto: BuyValtDto,
) {
  const prisma = new PrismaClient();
  const subscriptionService = new RecurrenceService();

  try {
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

    const chargeId = `C${assignee.id}V${valt.id}-${randomUUID()}`;

    const promotion = await verifyPromotions(
      valt.valtTypeId,
      valt.Squares?.Graveyards?.id,
      buyValtDto.items.map((item) => item.id || ''),
    );

    const saleValue =
      typeof assignee.rentValue === 'number' && assignee.rentValue > 0
        ? promotion.hasPromotion
          ? assignee.rentValue * (1 - promotion.discount / 100)
          : assignee.rentValue
        : promotion.hasPromotion
        ? valt.rentValue * (1 - promotion.discount / 100)
        : valt.rentValue;

    const customerInfo = {
      name: assignee.name,
      cpf: assignee?.cpf?.replace(/[\.\-\s]/g, ''),
      email: assignee.email,
      birth: new Date(assignee.birthdate).toISOString().split('T')[0],
      phone_number: assignee?.phone?.replace(/[^\d]/g, ''),
    };

    const items = [
      {
        amount: 1,
        name: 'Aluguel jazigo',
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

    const dueDay = assignee.payment.dueDay.padStart(2, '0');
    const expireDate = new Date(buyValtDto.expireDate);
    const adjustedExpireDate = new Date(
      expireDate.getFullYear(),
      expireDate.getMonth() + 1, // Add 1 month to the date
      parseInt(dueDay, 10),
    )
      .toISOString()
      .split('T')[0];

    const subscription = await subscriptionService.createSubscripton({
      items,
      custom_id: chargeId,
      type: 'BOLIX',
      payment: {
        banking_billet: {
          customer: customerInfo,
          expire_at: adjustedExpireDate,
        },
      },
    });

    const recurrenceData = await prisma.$transaction(async (prisma) => {
      const owner = await prisma.valtOwners.update({
        where: {
          id: ownerData.id,
        },
        data: {
          chargeId,
          amountValue: saleValue,
          serviceType: 'ALUGUEL',
          transactionType: 'SUBSCRIPTION',
          amountInstallments: Number(buyValtDto.installmentQuantity),
          status: 'AGUARDANDO_PAGAMENTO',
          assignee: { connect: { id: assignee.id } },
          valt: { connect: { id: valt.id } },
          payment: {
            create: {
              financialManagementId: 1,
              assigneeId: assignee.id,
              chargeId,
              method: 'RECORRENCIA',
              serviceType: 'ALUGUEL',
              values: saleValue,
            },
          },
        },
      });

      const recurrence = await prisma.recurrenceSubscriptions.create({
        data: {
          tokenUsed: buyValtDto.creditToken ?? null,
          RecurrencePlan: {
            connect: { plan_id: subscription.data.plan.id },
          },
          amountCharged: saleValue,
          paymentMethod: 'BOLIX',
          status: 'ACTIVE',
          subscriptionGatewayId: subscription.data.subscription_id.toString(),
          subscriptionType: 'RENT',
          assignee: {
            connect: {
              id: assignee.id,
            },
          },
          subscriptionUse: {
            create: {
              valtUsed: {
                connect: {
                  id: valt.id,
                },
              },
            },
          },
        },
      });

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: subscription.data.subscription_id.toString(),
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'RECORRENCIA',
          expireDate: new Date(buyValtDto.expireDate),
          paymentLink: subscription.data.billet_link,
          pdfLink: subscription.data.pdf.charge,
          ValtOwners: { connect: { id: owner.id } },
        },
      });

      return recurrence;
    });

    return recurrenceData;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
