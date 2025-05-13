interface StatusChange {
  created_at: string;
  custom_id: string | null;
  id: number;
  identifiers: {
    charge_id?: number;
    subscription_id?: number;
    carnet_id?: number;
  };
  status: {
    current: string;
    previous: string | null;
  };
  type: string;
  received_by_bank_at?: string;
  value?: number;
}

interface ApiResponse {
  data: StatusChange[];
}

type TransactionType = 'CHARGE' | 'SUBSCRIPTION' | 'CARNET';

/**
 * Verifica se o objeto possui dois ou mais dos status que indicam inadimplência
 * para o tipo de transação especificado
 *
 * @param response Objeto de resposta da API
 * @param transactionType Tipo de transação a ser verificada ('CHARGE', 'SUBSCRIPTION' ou 'CARNET')
 * @returns boolean - true se estiver inadimplente, false caso contrário
 */
interface DefaulterResult {
  isDefaulter: boolean;
  defaulterCharges: {
    id: number;
    status: string;
    type: string;
    value?: number;
    received_by_bank_at?: string;
  }[];
  message: string;
}

/**
 * Verifica se o objeto possui dois ou mais dos status que indicam inadimplência
 * para o tipo de transação especificado e retorna detalhes das parcelas inadimplentes
 *
 * @param response Objeto de resposta da API
 * @param transactionType Tipo de transação a ser verificada ('CHARGE', 'SUBSCRIPTION' ou 'CARNET')
 * @returns DefaulterResult - objeto com status de inadimplência, parcelas e mensagem
 */

function returnCorrectId(type: TransactionType, item: StatusChange) {
  switch (true) {
    case type == 'CARNET':
      return item.identifiers.carnet_id;
    case type == 'CHARGE':
      return item.identifiers.charge_id;
    case type == 'SUBSCRIPTION':
      return item.identifiers.subscription_id;
  }
}

export async function verifyDefaulters(
  response: ApiResponse,
  type: TransactionType,
  totalValue: number,
  totalInstallments: number,
): Promise<DefaulterResult> {
  try {
    // Status que indicam inadimplência
    const defaulterStatus = ['unpaid', 'canceled', 'refunded', 'contested'];

    // Verifica se os dados existem
    if (!response.data || !Array.isArray(response.data)) {
      return {
        isDefaulter: false,
        defaulterCharges: [],
        message: 'Não há dados disponíveis para análise.',
      };
    }

    // Mapeia os tipos de transação para os padrões correspondentes nos dados
    const transactionMapping: { [key in TransactionType]: string[] } = {
      CHARGE: ['charge'],
      SUBSCRIPTION: ['subscription', 'subscription_charge'],
      CARNET: ['carnet', 'carnet_charge'],
    };

    // Obtém os tipos correspondentes ao tipo de transação solicitado
    const correctTypesFounded = transactionMapping[type];

    // Filtra os itens pelo tipo de transação e status que indicam inadimplência
    const defaulterItems = response.data.filter((item) => {
      return (
        correctTypesFounded.includes(item.type) &&
        defaulterStatus.includes(item.status.current)
      );
    });

    // Verifica se há 2 ou mais parcelas inadimplentes
    const isDefaulter = defaulterItems.length >= 2;

    // Calcula o valor de cada parcela
    const installmentValue = totalValue / totalInstallments;

    // Mapeia as parcelas inadimplentes para o formato de retorno, removendo o campo received_by_bank_at
    const defaulterCharges = defaulterItems.map((item) => ({
      id: returnCorrectId(type, item),
      status: item.status.current,
      type: item.type,
      value: installmentValue,
    }));

    // Cria mensagem apropriada
    let message = '';
    if (defaulterCharges.length === 0) {
      message = 'Não há parcelas inadimplentes.';
    } else if (isDefaulter) {
      message = `Cliente inadimplente com ${defaulterCharges.length} parcela(s) pendente(s).`;
    } else {
      message = `Cliente com ${defaulterCharges.length} parcela(s) pendente(s), mas não considerado inadimplente.`;
    }

    return {
      isDefaulter,
      defaulterCharges,
      message,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
