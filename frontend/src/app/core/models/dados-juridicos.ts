import { SimOuNao } from "./types/tipos.type";

export interface DadosJuridicos {
     cpfCnpj: number;
     nome: string;
     contrato: number;
     ajuizado: SimOuNao;
     numProcesso: number | null;
     custas: number | null;
     honorarios: number | null;
   
}
