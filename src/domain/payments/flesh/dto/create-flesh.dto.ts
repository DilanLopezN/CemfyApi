export class CreateFleshDto {
  items: Array<{
    name: string;
    value: number;
    amount: number;
  }>;
  discountValue?: number;
  customer: {
    name: string;
    email: string;
    cpf: string;
    birth: string;
    phone_number: string;
  };
  repeats: number;
  split_items: false;
  expire_at: string;
  customId: string;
}
