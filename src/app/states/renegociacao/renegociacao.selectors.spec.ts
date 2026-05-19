import { initialRenegociacaoState, RenegociacaoState } from './renegociacao.state';
import {
  selectConsultaJuridica,
  selectContrato,
  selectError,
  selectLoading,
  selectResultado,
  selectSession,
  selectSimulacao,
  selectStepAtual,
  selectValidacaoOperacional,
} from './renegociacao.selectors';

describe('renegociacao selectors', () => {
  const state: RenegociacaoState = {
    ...initialRenegociacaoState,
    loading: true,
    error: 'erro',
    session: {
      ...initialRenegociacaoState.session,
      stepAtual: 2,
      contrato: {
        numero: '1001',
        cliente: 'Cliente Teste',
        cpfCnpj: '12345678901',
        produto: 'CDC',
        valorDevido: 12000,
        dataVencimento: '2026-01-01',
        status: 'APTO',
      },
      validacaoOperacional: {
        status: 'APROVADO',
        aptoParaRenegociacao: true,
        impedimentos: [],
        uploadAtendido: true,
        checksEtapasAnteriores: true,
        validadoEm: '2026-01-01T10:00:00',
      },
      consultaJuridica: {
        solicitacaoId: 'SOL-1',
        status: 'APROVADO',
        parecer: null,
        custasObrigatorias: 1000,
        validadoEm: '2026-01-01T11:00:00',
      },
      simulacao: {
        valorEntrada: 1000,
        numeroParcelas: 10,
        valorParcela: 200,
        taxaJuros: 1.1,
        totalPago: 3000,
        totalJuros: 500,
        parcelas: [{ numero: 1, valor: 200, vencimento: '2026-02-01' }],
      },
      resultado: {
        aprovado: true,
        motivoRecusa: null,
        novoContratoNumero: 'A-1',
      },
    },
  };

  const root = { renegociacao: state };

  it('deve selecionar sessão principal', () => {
    expect(selectSession(root)).toEqual(state.session);
  });

  it('deve selecionar flags de loading e erro', () => {
    expect(selectLoading(root)).toBeTrue();
    expect(selectError(root)).toBe('erro');
  });

  it('deve selecionar dados detalhados da sessão', () => {
    expect(selectContrato(root)?.numero).toBe('1001');
    expect(selectValidacaoOperacional(root)?.status).toBe('APROVADO');
    expect(selectConsultaJuridica(root)?.status).toBe('APROVADO');
    expect(selectSimulacao(root)?.numeroParcelas).toBe(10);
    expect(selectResultado(root)?.novoContratoNumero).toBe('A-1');
    expect(selectStepAtual(root)).toBe(2);
  });
});
