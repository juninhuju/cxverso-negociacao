import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
    ConsultaJuridica,
    Contrato,
    ResultadoRenegociacao,
    SimulacaoRenegociacao,
    ValidacaoOperacional,
} from '../../features/renegociacao/models/renegociacao.model';

export const RenegociacaoActions = createActionGroup({
  source: 'Renegociacao',
  events: {
    // Busca de contrato
    'Buscar Contrato': props<{ termo: string }>(),
    'Buscar Contrato Success': props<{ contrato: Contrato }>(),
    'Buscar Contrato Failure': props<{ error: string }>(),

    // Validação operacional
    'Solicitar Validacao Operacional': props<{ numeroContrato: string }>(),
    'Solicitar Validacao Operacional Success': props<{ validacao: ValidacaoOperacional }>(),
    'Solicitar Validacao Operacional Failure': props<{ error: string }>(),

    // Consulta jurídica
    'Solicitar Consulta Juridica': props<{ numeroContrato: string }>(),
    'Solicitar Consulta Juridica Success': props<{ consulta: ConsultaJuridica }>(),
    'Solicitar Consulta Juridica Failure': props<{ error: string }>(),

    // Simulação
    'Simular Renegociacao': props<{ valorEntrada: number; numeroParcelas: number }>(),
    'Simular Renegociacao Success': props<{ simulacao: SimulacaoRenegociacao }>(),
    'Simular Renegociacao Failure': props<{ error: string }>(),

    // Formalização
    'Formalizar Renegociacao': emptyProps(),
    'Formalizar Renegociacao Success': props<{ resultado: ResultadoRenegociacao }>(),
    'Formalizar Renegociacao Failure': props<{ error: string }>(),

    // Navegação
    'Avancar Step': emptyProps(),
    'Voltar Step': emptyProps(),
    'Reiniciar Sessao': emptyProps(),
  },
});
