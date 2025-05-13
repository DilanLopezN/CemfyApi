type PromotionDTO = {
  discount: number;
  hasPromotion: boolean;
  applicablePromotions?: Array<{
    serviceId?: string;
    promotionId: string;
    type: 'valtType' | 'service' | 'graveyard';
  }>;
};

type ItemDTO = {
  id?: string;
  value: number;
};
export function DiscountService(promotionDto: PromotionDTO, item: ItemDTO) {
  const existServiceWithDiscount = promotionDto.applicablePromotions.find(
    (p) => p.type == 'service',
  )?.serviceId;

  if (!existServiceWithDiscount) return;

  const itemAllowedToPromotion = existServiceWithDiscount == item.id;

  if (itemAllowedToPromotion) {
    return item.value * (1 - promotionDto.discount / 100);
  }
}
