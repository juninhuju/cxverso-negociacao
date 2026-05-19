import { RenegociacaoActions } from './renegociacao.actions';
import { renegociacaoReducer } from './renegociacao.reducer';
import { initialRenegociacaoState } from './renegociacao.state';

describe('renegociacaoReducer', () => {
  const contrato = {
    numero: '1001',
    cliente: 'Cliente Teste',
    cpfCnpj: '12345678901',
    produto: 'CDC',
    valorDevido: 10000,
    dataVencimento: '2026-01-15',
    status: 'APTO' as const,
  };

  it('deve ativar loading em buscarContrato', () => {
    const state = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.buscarContrato({ termo: '1001' }),
    );

    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('deve armazenar contrato em buscarContratoSuccess', () => {
    const state = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.buscarContratoSuccess({ contrato }),
    );

    expect(state.loading).toBeFalse();
    expect(state.session.contrato).toEqual(contrato);
  });

  it('deve armazenar erro em buscarContratoFailure', () => {
    const state = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.buscarContratoFailure({ error: 'falha' }),
    );

    expect(state.loading).toBeFalse();
    expect(state.error).toBe('falha');
  });

  it('deve avançar e voltar step respeitando limite inferior', () => {
    const advanced = renegociacaoReducer(initialRenegociacaoState, RenegociacaoActions.avancarStep());
    const backOnce = renegociacaoReducer(advanced, RenegociacaoActions.voltarStep());
    const backTwice = renegociacaoReducer(backOnce, RenegociacaoActions.voltarStep());

    expect(advanced.session.stepAtual).toBe(0);
    expect(backOnce.session.stepAtual).toBe(-1);
    expect(backTwice.session.stepAtual).toBe(-1);
  });

  it('deve reiniciar sessão para estado inicial', () => {
    const dirtyState = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.buscarContratoSuccess({ contrato }),
    );

    const resetState = renegociacaoReducer(dirtyState, RenegociacaoActions.reiniciarSessao());

    expect(resetState).toEqual(initialRenegociacaoState);
  });

  it('deve definir contrato diretamente e limpar dados derivados', () => {
    const state = renegociacaoReducer(
      {
        ...initialRenegociacaoState,
        session: {
          ...initialRenegociacaoState.session,
          validacaoOperacional: {
            status: 'APROVADO',
            aptoParaRenegociacao: true,
            impedimentos: [],
            uploadAtendido: true,
            checksEtapasAnteriores: true,
            validadoEm: '2026-01-01',
          },
        },
      },
      RenegociacaoActions.definirContrato({ contrato }),
    );

    expect(state.session.contrato).toEqual(contrato);
    expect(state.session.validacaoOperacional).toBeNull();
    expect(state.session.consultaJuridica).toBeNull();
    expect(state.session.simulacao).toBeNull();
    expect(state.session.resultado).toBeNull();
  });

  it('deve tratar ciclo de validação operacional (request/success/failure)', () => {
    const requested = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.solicitarValidacaoOperacional({ numeroContrato: '1001' }),
    );

    expect(requested.loading).toBeTrue();
    expect(requested.error).toBeNull();

    const validacao = {
      status: 'APROVADO' as const,
      aptoParaRenegociacao: true,
      impedimentos: [] as string[],
      uploadAtendido: true,
      checksEtapasAnteriores: true,
      validadoEm: '2026-01-01',
    };
    const success = renegociacaoReducer(
      requested,
      RenegociacaoActions.solicitarValidacaoOperacionalSuccess({ validacao }),
    );
    expect(success.loading).toBeFalse();
    expect(success.session.validacaoOperacional).toEqual(validacao);

    const failed = renegociacaoReducer(
      requested,
      RenegociacaoActions.solicitarValidacaoOperacionalFailure({ error: 'erro validacao' }),
    );
    expect(failed.loading).toBeFalse();
    expect(failed.error).toBe('erro validacao');
  });

  it('deve tratar ciclo de consulta juridica (request/success/failure)', () => {
    const requested = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.solicitarConsultaJuridica({ numeroContrato: '1001' }),
    );

    const consulta = {
      solicitacaoId: 'S-1',
      status: 'APROVADO' as const,
      parecer: null,
      custasObrigatorias: 100,
      validadoEm: '2026-01-01',
    };
    const success = renegociacaoReducer(
      requested,
      RenegociacaoActions.solicitarConsultaJuridicaSuccess({ consulta }),
    );
    expect(success.loading).toBeFalse();
    expect(success.session.consultaJuridica).toEqual(consulta);

    const failed = renegociacaoReducer(
      requested,
      RenegociacaoActions.solicitarConsultaJuridicaFailure({ error: 'erro juridico' }),
    );
    expect(failed.loading).toBeFalse();
    expect(failed.error).toBe('erro juridico');
  });

  it('deve tratar ciclo de simulação (request/success/failure)', () => {
    const requested = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.simularRenegociacao({ valorEntrada: 100, numeroParcelas: 10 }),
    );

    const simulacao = {
      valorEntrada: 100,
      numeroParcelas: 10,
      valorParcela: 50,
      taxaJuros: 1,
      totalPago: 600,
      totalJuros: 100,
      parcelas: [],
    };
    const success = renegociacaoReducer(
      requested,
      RenegociacaoActions.simularRenegociacaoSuccess({ simulacao }),
    );
    expect(success.loading).toBeFalse();
    expect(success.session.simulacao).toEqual(simulacao);

    const failed = renegociacaoReducer(
      requested,
      RenegociacaoActions.simularRenegociacaoFailure({ error: 'erro simulacao' }),
    );
    expect(failed.loading).toBeFalse();
    expect(failed.error).toBe('erro simulacao');
  });

  it('deve tratar ciclo de formalização (request/success/failure)', () => {
    const requested = renegociacaoReducer(
      initialRenegociacaoState,
      RenegociacaoActions.formalizarRenegociacao(),
    );

    const resultado = {
      aprovado: true,
      motivoRecusa: null,
      novoContratoNumero: 'N-1',
    };
    const success = renegociacaoReducer(
      requested,
      RenegociacaoActions.formalizarRenegociacaoSuccess({ resultado }),
    );
    expect(success.loading).toBeFalse();
    expect(success.session.resultado).toEqual(resultado);

    const failed = renegociacaoReducer(
      requested,
      RenegociacaoActions.formalizarRenegociacaoFailure({ error: 'erro formalizacao' }),
    );
    expect(failed.loading).toBeFalse();
    expect(failed.error).toBe('erro formalizacao');
  });
});
