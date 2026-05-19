import { createReducer, on } from '@ngrx/store';
import { RenegociacaoActions } from './renegociacao.actions';
import { initialRenegociacaoState } from './renegociacao.state';

export const renegociacaoReducer = createReducer(
  initialRenegociacaoState,

  // Definir contrato diretamente
  on(RenegociacaoActions.definirContrato, (state, { contrato }) => ({
    ...state,
    loading: false,
    error: null,
    session: { ...state.session, contrato },
  })),

  // Busca de contrato
  on(RenegociacaoActions.buscarContrato, (state) => ({ ...state, loading: true, error: null })),
  on(RenegociacaoActions.buscarContratoSuccess, (state, { contrato }) => ({
    ...state,
    loading: false,
    session: { ...state.session, contrato },
  })),
  on(RenegociacaoActions.buscarContratoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Validação operacional
  on(RenegociacaoActions.solicitarValidacaoOperacional, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RenegociacaoActions.solicitarValidacaoOperacionalSuccess, (state, { validacao }) => ({
    ...state,
    loading: false,
    session: { ...state.session, validacaoOperacional: validacao },
  })),
  on(RenegociacaoActions.solicitarValidacaoOperacionalFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Consulta jurídica
  on(RenegociacaoActions.solicitarConsultaJuridica, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RenegociacaoActions.solicitarConsultaJuridicaSuccess, (state, { consulta }) => ({
    ...state,
    loading: false,
    session: { ...state.session, consultaJuridica: consulta },
  })),
  on(RenegociacaoActions.solicitarConsultaJuridicaFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Simulação
  on(RenegociacaoActions.simularRenegociacao, (state) => ({ ...state, loading: true, error: null })),
  on(RenegociacaoActions.simularRenegociacaoSuccess, (state, { simulacao }) => ({
    ...state,
    loading: false,
    session: { ...state.session, simulacao },
  })),
  on(RenegociacaoActions.simularRenegociacaoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Formalização
  on(RenegociacaoActions.formalizarRenegociacao, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RenegociacaoActions.formalizarRenegociacaoSuccess, (state, { resultado }) => ({
    ...state,
    loading: false,
    session: { ...state.session, resultado },
  })),
  on(RenegociacaoActions.formalizarRenegociacaoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Navegação
  on(RenegociacaoActions.avancarStep, (state) => ({
    ...state,
    session: { ...state.session, stepAtual: state.session.stepAtual + 1 },
  })),
  on(RenegociacaoActions.voltarStep, (state) => ({
    ...state,
    session: {
      ...state.session,
      stepAtual: Math.max(-1, state.session.stepAtual - 1),
    },
  })),
  on(RenegociacaoActions.reiniciarSessao, () => initialRenegociacaoState),
);
