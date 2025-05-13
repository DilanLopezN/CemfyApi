export class CreateCreditDto {
  customId: string;
  installment?: boolean;
  installmentQuantity: number;
  items: Array<{
    name: string;
    value: number;
    amount: number;
  }>;
  payment: {
    discountValue?: number;
    credit_card: {
      customer: {
        name: string;
        cpf: string;
        email: string;
        phone_number: string;
      };
      installments: number;
      payment_token: string;
    };
  };
}

export class ReturnCreditDto {
  installments: number;
  installment_value: number;
  charge_id: number;
  status: string;
  total: number;
  payment: string;
}
