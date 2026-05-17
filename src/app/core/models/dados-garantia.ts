export interface DadosGarantia {
    id: number;
    tipo: string;
    valorGarantia: number;
    matricula: number;
    cartorio: string;
    endereco: string;
    dataLaudo: string;
    laudo: "VALIDO" | "INVALIDO"
}
