export type StatusContrato =
  | 'APTO'
  | 'EXECUCAO_EXTRAJUDICIAL'
  | 'INADIMPLENTE'
  | 'EM_ACORDO'
  | 'REGULARIZADO'
  | 'CEDIDO';

export interface Contrato {
  readonly numero: string;
  readonly cliente: string;
  readonly cpfCnpj: string;
  readonly produto: string;
  readonly valorDevido: number;
  readonly dataVencimento: string;
  readonly status: StatusContrato;
  readonly diasAtraso?: number;
  readonly garantia?: string;
}
