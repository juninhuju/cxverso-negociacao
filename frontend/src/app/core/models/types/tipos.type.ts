export type TipoPessoa = "Pessoa Física" | "Pessoa Jurídica"

export type SimOuNao = "Sim" | "Não"

export type ExisteExecucao =  "Em execução Judicial" | "Inadimplente - Não Ajuizado" | "Em execução Extrajudicial"

export type StatusProposta = 
  | "EM_ANALISE"
  | "APROVADA"
  | "REJEITADA";

export type FaseProcesso =
  | "NÃO INTIMADO"
  | "INTIMADO"
  | "GARANTIA CONSOLIDADA"
  | "ENCERRADO COM INSUCESSO"
  | "ENCERRADO COM SUCESSO";
  
export type NomeProduto =
 | "Crédito comercial";
  