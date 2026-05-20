import { TipoPessoa, SimOuNao } from './types/tipos.type';

export interface DadosComerciais {
    contrato: number;
    operacao: number;
    nomeProduto: string;
    nome: string;
    cpfCnpj: string;
    tipo: TipoPessoa;
    dividaTotal: number;
    valorEstagio3: number;
    dataEstagio3: string;
    atraso: number;
    emExecucao: SimOuNao
    dataFase: string;
    garantiaReal: SimOuNao     
    
}
