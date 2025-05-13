import { Prisma, PrismaClient } from '@prisma/client';
import { env } from 'src/core/env';
import { BuyValtDto } from '../dto/create-valt.dto';
import { PixService } from 'src/domain/payments/pix/pix.service';
import { randomUUID } from 'crypto';
import verifyPromotions from './verify-promotions';
import { DiscountService } from './discount-service';
import { makeManagementService } from 'src/core/factories/make.financial.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';
const prisma = new PrismaClient();
const pixService = new PixService();

export async function buyValtPix(
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType & {
    Squares: {
      Graveyards: {
        id: string;
      };
    };
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
    const data = await prisma.$transaction(async (prisma) => {
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

      const items = [
        ...buyValtDto.items.map((item) => {
          const discountedValue = DiscountService(promotion, {
            id: item.id,
            value: item.value,
          });

          return {
            amount: item.amount,
            name: item.name,
            value: discountedValue ?? item.value,
          };
        }),
      ];

      const itemsTotal = items.reduce((total, item) => {
        return total + item.value * item.amount;
      }, 0);

      let totalValue;
      if (buyValtDto.isEntry) {
        const value = Number(buyValtDto.entryValue);
        totalValue = value;
      } else {
        totalValue = saleValue + itemsTotal;
      }
      const { txId, pixCopy, pixLink, qrCode } = await pixService.create_charge(
        {
          custom_id: `C${assignee.id}V${valt.id}${randomUUID()
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(
              0,
              Math.max(26 - `C${assignee.id}V${valt.id}`.length, 0),
            )}`,

          calendario: {
            expiracao: 3600,
          },
          chave: env.PIX_KEY,
          devedor: {
            cpf: assignee.cpf.replace(/\D/g, ''),
            nome: assignee.name,
          },
          valor: {
            original: (totalValue * 100).toFixed(2),
          },
          solicitacaoPagador: 'Venda de Jazigo',
        },
      );

      const owner = await prisma.valtOwners.update({
        where: {
          id: ownerData.id,
        },
        data: {
          chargeId: txId,
          amountValue: saleValue,
          serviceType: 'VENDA',
          transactionType: 'CHARGE',
          entryValue: Number(buyValtDto.isEntry ? buyValtDto.entryValue : null),
          restAmount: buyValtDto.isEntry
            ? Number(Number(saleValue) - Number(buyValtDto.entryValue))
            : 0,
          amountInstallments: Number(buyValtDto.installmentQuantity) ?? 1,
          status: 'AGUARDANDO_PAGAMENTO',
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
              chargeId: txId,
              method: 'PIX',
              serviceType: 'VENDA',
              values: saleValue,
            },
          },
        },
      });

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: txId,
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'PIX',
          expireDate: new Date(buyValtDto.expireDate),
          paymentLink: pixLink,
          pdfLink: qrCode,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });

      return { pixCopy, qrCode };
    });

    return data;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
