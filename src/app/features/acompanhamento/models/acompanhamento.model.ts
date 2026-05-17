export type StatusRenegociacao =
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'AGUARDANDO_JURIDICO';

export interface RenegociacaoResumo {
  readonly id: string;
  readonly numeroContrato: string;
  readonly cliente: string;
  readonly valorTotal: number;
  readonly dataInicio: string;
  readonly status: StatusRenegociacao;
}

export interface KpiAcompanhamento {
  readonly totalRenegociacoes: number;
  readonly emAndamento: number;
  readonly concluidas: number;
  readonly aguardandoJuridico: number;
  readonly valorTotalRenegociado: number;
}
