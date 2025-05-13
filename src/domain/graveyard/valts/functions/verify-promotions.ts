import { PrismaClient } from '@prisma/client';

async function verifyPromotions(
  valtType: number = 0,
  graveyardId: string = '',
  servicesId: string[] = [],
) {
  const prisma = new PrismaClient();
  const currentDate = new Date();
  const applicablePromotions = [];

  try {
    // Verificar se há uma promoção válida para o cemitério
    if (graveyardId) {
      const graveyardPromotion = await prisma.promotion.findFirst({
        where: {
          graveyards: {
            some: {
              id: graveyardId,
            },
          },
          isActive: true,
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
        },
      });

      if (graveyardPromotion) {
        applicablePromotions.push({
          type: 'graveyard',
          discount: graveyardPromotion.discount,
          promotionName: graveyardPromotion.name,
          promotionId: graveyardPromotion.id,
        });
      }
    }

    // Verificar se há uma promoção válida para o tipo de jazigo
    if (valtType) {
      const valtTypeFinded = await prisma.valtType.findUnique({
        where: { id: valtType },
      });

      if (valtTypeFinded) {
        const valtTypePromotion = await prisma.promotion.findFirst({
          where: {
            promotedValtsTypes: {
              some: {
                valtType: valtTypeFinded.valtType,
              },
            },
            isActive: true,
            startDate: { lte: currentDate },
            endDate: { gte: currentDate },
          },
        });

        if (valtTypePromotion) {
          applicablePromotions.push({
            type: 'valtType',
            discount: valtTypePromotion.discount,
            promotionName: valtTypePromotion.name,
            promotionId: valtTypePromotion.id,
          });
        }
      }
    }

    // Verificar se há promoções válidas para os serviços
    if (servicesId.length > 0) {
      const servicesPromotions = await prisma.promotion.findMany({
        where: {
          promotedServices: {
            some: {
              id: {
                in: servicesId,
              },
            },
          },

          isActive: true,
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
        },
        include: {
          promotedServices: true,
        },
      });

      if (servicesPromotions.length > 0) {
        servicesPromotions.forEach((promotion, index) => {
          applicablePromotions.push({
            serviceId: promotion?.promotedServices[index]?.id,
            type: 'service',
            discount: promotion.discount,
            promotionName: promotion.name,
            promotionId: promotion.id,
          });
        });
      }
    }

    // Se não houver promoção válida
    if (applicablePromotions.length === 0) {
      return {
        discount: 0,
        hasPromotion: false,
        applicablePromotions: [],
      };
    }

    const totalDiscount = applicablePromotions.reduce(
      (sum, promotion) => sum + promotion.discount,
      0,
    );
    const averageDiscount = totalDiscount / applicablePromotions.length;

    return {
      discount: averageDiscount,
      hasPromotion: true,
      applicablePromotions: applicablePromotions,
      totalApplicablePromotions: applicablePromotions.length,
    };
  } catch (error) {
    console.error('Erro ao verificar promoções:', error);
    return {
      discount: 0,
      hasPromotion: false,
      error: 'Erro ao verificar promoções',
      applicablePromotions: [],
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyPromotions;
