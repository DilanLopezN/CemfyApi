export class CreatePixDto {
  /**
   * Chave refere-se ao pix do recebedor!
   */
  custom_id: string;
  chave: string;
  devedor: {
    cpf: string;
    nome: string;
  };
  calendario: {
    expiracao: number;
  };
  valor: {
    original: string;
  };
  solicitacaoPagador: string;
}
