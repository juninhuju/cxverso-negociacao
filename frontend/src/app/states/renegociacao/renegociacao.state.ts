import { RenegociacaoSession } from '../../features/renegociacao/models/renegociacao.model';

export interface RenegociacaoState {
  readonly session: RenegociacaoSession;
  readonly loading: boolean;
  readonly error: string | null;
}

export const initialRenegociacaoState: RenegociacaoState = {
  session: {
    contratos: [],
    contrato: null,
    validacaoOperacional: null,
    consultaJuridica: null,
    simulacao: null,
    resultado: null,
    // Inicia na rota de busca, antes da primeira etapa visível do sidebar.
    stepAtual: -1,
  },
  loading: false,
  error: null,
};
