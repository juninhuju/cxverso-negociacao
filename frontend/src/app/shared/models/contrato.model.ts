export type StatusContrato =
  | 'APTO'
  | 'EXECUCAO_EXTRAJUDICIAL'
  | 'INADIMPLENTE'
  | 'EM_ACORDO'
  | 'REGULARIZADO'
  | 'CEDIDO';

export type StatusValidacao = 'APROVADO' | 'PENDENTE' | 'REPROVADO';

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

export interface Garantias {
  readonly tipo: string;
  readonly descricao: string;
  readonly valorGarantia: number | null;
  readonly registroGarantia: string | null;
}

export interface ContratoDetalhe {
  readonly id: number;
  readonly clienteId: number;
  readonly tipoContrato: string;
  readonly saldoDevedor: number;
  readonly desconto: number | null;
  readonly valorDesconto: number | null;
  readonly saldoRenegociado: number | null;
  readonly entradaNegociacao: number | null;
  readonly entradaTotal: number | null;
  readonly valorFinanciado: number | null;
  readonly parcelaMinima: number | null;
  readonly parcelaMaxima: number | null;
  readonly jurosAoMesTaxa: number | null;
  readonly iofTaxa: number | null;
  readonly cet: number | null;
  readonly possuiGarantia: boolean;
  readonly quantidadeGarantias: number;
  readonly garantias: readonly Garantias[];
  readonly statusDivida: string;
  readonly statusNegociacao: string;
  readonly custasCartorarias: number;
  readonly custas: number;
  readonly honorarios: number;
}

export interface ConsultaJuridica {
  readonly solicitacaoId: string;
  readonly status: StatusValidacao;
  readonly parecer: string | null;
  readonly custasObrigatorias: number;
  readonly validadoEm: string | null;
}

export interface ValidacaoOperacional {
  readonly status: StatusValidacao;
  readonly aptoParaRenegociacao: boolean;
  readonly impedimentos: readonly string[];
  readonly uploadAtendido: boolean;
  readonly checksEtapasAnteriores: boolean;
  readonly validadoEm: string | null;
}

export interface Parcela {
  readonly numero: number;
  readonly valor: number;
  readonly vencimento: string;
}

export interface SimulacaoRenegociacao {
  readonly valorEntrada: number;
  readonly numeroParcelas: number;
  readonly valorParcela: number;
  readonly taxaJuros: number;
  readonly totalPago: number;
  readonly totalJuros: number;
  readonly parcelas: readonly Parcela[];
}

export interface OpcaoSimulacao {
  readonly id: number;
  readonly descricao: string;
  readonly valorEntrada: number;
  readonly numeroParcelas: number;
  readonly taxaJuros: number;
  readonly valorParcela: number;
  readonly economiaTotal: number;
  readonly detalhes: string;
}

export interface SimulacoesDisponiveis {
  readonly numeroContrato: string;
  readonly nomeCliente: string;
  readonly opcoes: readonly OpcaoSimulacao[];
}

export interface ResultadoRenegociacao {
  readonly aprovado: boolean;
  readonly motivoRecusa: string | null;
  readonly novoContratoNumero: string | null;
}

export interface RenegociacaoSession {
  readonly contratos: readonly Contrato[];
  readonly contrato: Contrato | null;
  readonly validacaoOperacional: ValidacaoOperacional | null;
  readonly consultaJuridica: ConsultaJuridica | null;
  readonly simulacao: SimulacaoRenegociacao | null;
  readonly resultado: ResultadoRenegociacao | null;
  readonly stepAtual: number;
}
