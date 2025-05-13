export class CreateBilletDto {
  customId: string;
  installment?: boolean;
  installmentQuantity: number;
  payment: {
    banking_billet: {
      expire_at: string;
      customer: {
        name: string;
        email: string;
        cpf: string;
        birth: string;
        phone_number: string;
      };
      discountValue?: number;
    };
  };
  items: Array<{
    name: string;
    value: number;
    amount: number;
  }>;

  shippings?: Array<{
    name?: string;
    value?: number;
  }>;
}

export class BilletReturnDTO {
  charge_id: number;
  total: number;
  status: string;
  barcode?: string;
  pix?: {
    qrcode: string;
    qrcode_image: string;
  };
  link?: string;
  billet_link?: string;
  pdf?: {
    charge: string;
  };
  expire_at?: string;
  installments?: number;
  installment_value?: number;
  refusal?: {
    reason: string;
    retry: boolean;
  };
  payment: string;
}
