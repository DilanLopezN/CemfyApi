export interface ReturnPixDto {
  calendario: Calendario;
  txid: string;
  revisao: number;
  loc: LOC;
  location: string;
  status: string;
  devedor: Devedor;
  valor: Valor;
  chave: string;
  solicitacaoPagador: string;
  pixCopiaECola: string;
}

export interface Calendario {
  criacao: Date;
  expiracao: number;
}

export interface Devedor {
  cnpj: string;
  nome: string;
}

export interface LOC {
  id: number;
  location: string;
  tipoCob: string;
}

export interface Valor {
  original: string;
}
