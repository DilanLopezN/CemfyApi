export enum TypePlans {
  SEMESTRAL,
  MENSAL,
  TRIMESTRAL,
}

export class CreatePlanDto {
  name: string; // Nome do plano de assinatura (1 a 255 caracteres)

  interval: number; // Intervalo em meses (1 a 24), define a periodicidade da cobrança

  repeats?: number; // Número de vezes que a cobrança será gerada (mínimo 2, máximo 120, opcional)

  type: string;
}

export class CreateSubscriptonDtO {
  type: 'BOLIX' | 'CREDIT';
  custom_id: string;

  items: Array<{
    name: string;
    value: number;
    amount: number;
  }>;
  discountValue?: number;
  payment:
    | {
        banking_billet: {
          expire_at: string;
          customer: {
            name: string;
            email: string;
            cpf: string;
            birth: string;
            phone_number: string;
            address?: {
              street: string;
              number: string;
              neighborhood: string;
              zipcode: string;
              city: string;
              complement: '';
              state: string;
            };
          };
        };
      }
    | {
        discountValue?: number;
        credit_card: {
          customer: {
            name: string;
            cpf: string;
            email: string;
            birth: string;
            phone_number: string;
          };

          payment_token: string;
          address?: {
            street: string;
            number: string;
            neighborhood: string;
            zipcode: string;
            city: string;
            complement: '';
            state: string;
          };
        };
      };
}
