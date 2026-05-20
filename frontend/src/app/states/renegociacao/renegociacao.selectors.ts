import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RenegociacaoSession } from '../../features/renegociacao/models/renegociacao.model';
import { RenegociacaoState } from './renegociacao.state';

export const selectRenegociacaoState = createFeatureSelector<RenegociacaoState>('renegociacao');

export const selectSession = createSelector(
	selectRenegociacaoState,
	(state: RenegociacaoState): RenegociacaoSession => state.session,
);
export const selectLoading = createSelector(
	selectRenegociacaoState,
	(state: RenegociacaoState): boolean => state.loading,
);
export const selectError = createSelector(
	selectRenegociacaoState,
	(state: RenegociacaoState): string | null => state.error,
);

export const selectContrato = createSelector(selectSession, (session: RenegociacaoSession) => session.contrato);
export const selectValidacaoOperacional = createSelector(
	selectSession,
	(session: RenegociacaoSession) => session.validacaoOperacional,
);
export const selectConsultaJuridica = createSelector(
	selectSession,
	(session: RenegociacaoSession) => session.consultaJuridica,
);
export const selectSimulacao = createSelector(selectSession, (session: RenegociacaoSession) => session.simulacao);
export const selectResultado = createSelector(selectSession, (session: RenegociacaoSession) => session.resultado);
export const selectStepAtual = createSelector(selectSession, (session: RenegociacaoSession) => session.stepAtual);
