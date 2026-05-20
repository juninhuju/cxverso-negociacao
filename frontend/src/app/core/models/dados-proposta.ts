import { DadosComerciais } from './dados-comerciais';
import { DadosGarantia } from './dados-garantia';
import { DadosJuridicos } from './dados-juridicos';
import { StatusProposta } from './types/tipos.type';


export interface DadosProposta {
    idProposta: number;

    // dados vindos do comercial
    comercial: DadosComerciais;

    // dados jurídicos
    juridico?: DadosJuridicos;

    // uma proposta pode ter várias garantias
    garantias?: DadosGarantia[];

    // dados próprios da proposta
    valorEntrada: number;
    quantidadeParcelas: number;
    valorParcela: number;

    status: StatusProposta;

    observacao?: string;
}

// Como acessar no HTML

// <p>{{ proposta.comercial.nome }}</p>

// <p>{{ proposta.comercial.contrato }}</p>

// <p>{{ proposta.comercial.dividaTotal | currency }}</p>

// <p>{{ proposta.juridico?.ajuizado }}</p>
