import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RenegociacaoApiService } from './renegociacao-api.service';

describe('RenegociacaoApiService', () => {
  let service: RenegociacaoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RenegociacaoApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RenegociacaoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar contrato no mock por numero normalizado', () => {
    let resultNumero = '';

    service.buscarContrato(' 1001 ').subscribe((contrato) => {
      resultNumero = contrato.numero;
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush([
      {
        numero: '1001',
        cliente: 'Cliente 1',
        cpfCnpj: '123.456.789-01',
        produto: 'CDC',
        valorDevido: 10000,
        dataVencimento: '2026-01-01',
        status: 'APTO',
      },
    ]);

    expect(resultNumero).toBe('1001');
  });

  it('deve lançar erro quando contrato não for encontrado no mock', () => {
    let mensagemErro = '';

    service.buscarContrato('999').subscribe({
      next: () => fail('não deveria concluir com sucesso'),
      error: (error: Error) => {
        mensagemErro = error.message;
      },
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush([]);

    expect(mensagemErro).toContain('Contrato não encontrado');
  });

  it('deve carregar consulta juridica do mock', () => {
    let status = '';

    service.solicitarConsultaJuridica('1001').subscribe((consulta) => {
      status = consulta.status;
    });

    const req = httpMock.expectOne('/assets/consulta-juridica.json');
    req.flush({
      status: 'CONCLUIDA',
      aptoFormalizacao: true,
      observacoes: ['ok'],
      custasObrigatorias: 200,
    });

    expect(status).toBe('CONCLUIDA');
  });

  it('deve carregar validacao operacional do mock por contrato', () => {
    let validacaoStatus = '';

    service.solicitarValidacaoOperacional('1001').subscribe((validacao) => {
      validacaoStatus = validacao.status;
    });

    const req = httpMock.expectOne('/assets/validacao-operacional.json');
    req.flush([
      {
        numeroContrato: '1001',
        cliente: 'Cliente 1',
        status: 'APROVADO',
        aptoParaRenegociacao: true,
        impedimentos: [],
        uploadAtendido: true,
        checksEtapasAnteriores: true,
        validadoEm: '2026-01-01',
      },
    ]);

    expect(validacaoStatus).toBe('APROVADO');
  });

  it('deve retornar erro ao não encontrar validacao operacional', () => {
    let mensagemErro = '';

    service.solicitarValidacaoOperacional('x').subscribe({
      next: () => fail('não deveria concluir com sucesso'),
      error: (error: Error) => {
        mensagemErro = error.message;
      },
    });

    const req = httpMock.expectOne('/assets/validacao-operacional.json');
    req.flush([]);

    expect(mensagemErro).toContain('Validação operacional não encontrada');
  });

  it('deve carregar opções de simulação por contrato no mock', () => {
    let quantidade = 0;

    service.carregarOpcoesSimulacao('1001').subscribe((opcoes) => {
      quantidade = opcoes?.opcoes.length ?? 0;
    });

    const req = httpMock.expectOne('/assets/simulacao.json');
    req.flush([
      {
        numeroContrato: '1001',
        nomeCliente: 'Cliente 1',
        opcoes: [
          {
            id: 1,
            descricao: '12x',
            valorEntrada: 1000,
            numeroParcelas: 12,
            taxaJuros: 1.2,
            valorParcela: 500,
            economiaTotal: 100,
            detalhes: 'teste',
          },
        ],
      },
    ]);

    expect(quantidade).toBe(1);
  });

  it('deve retornar null quando não houver opções de simulação para contrato', () => {
    let resultadoNull = false;

    service.carregarOpcoesSimulacao('1001').subscribe((opcoes) => {
      resultadoNull = opcoes === null;
    });

    const req = httpMock.expectOne('/assets/simulacao.json');
    req.flush([]);

    expect(resultadoNull).toBeTrue();
  });

  it('deve calcular simulação personalizada a partir dos mocks', () => {
    let simulacaoParcelas = 0;

    service.simular('1001', 1000, 10).subscribe((simulacao) => {
      simulacaoParcelas = simulacao.parcelas.length;
      expect(simulacao.valorEntrada).toBe(1000);
      expect(simulacao.numeroParcelas).toBe(10);
      expect(simulacao.valorParcela).toBeGreaterThan(0);
      expect(simulacao.totalPago).toBeGreaterThan(1000);
    });

    const reqSimulacao = httpMock.expectOne('/assets/simulacao.json');
    const reqContratos = httpMock.expectOne('/assets/contratos.json');

    reqSimulacao.flush([
      {
        numeroContrato: '1001',
        nomeCliente: 'Cliente 1',
        opcoes: [
          {
            id: 1,
            descricao: '10x',
            valorEntrada: 1000,
            numeroParcelas: 10,
            taxaJuros: 1.5,
            valorParcela: 1000,
            economiaTotal: 500,
            detalhes: 'opcao',
          },
        ],
      },
    ]);

    reqContratos.flush([
      {
        numero: '1001',
        cliente: 'Cliente 1',
        cpfCnpj: '123',
        produto: 'CDC',
        valorDevido: 12000,
        dataVencimento: '2026-01-01',
        status: 'APTO',
      },
    ]);

    expect(simulacaoParcelas).toBe(10);
  });

  it('deve formalizar via mock em ambiente dev', () => {
    let novoContratoNumero = '';

    service.formalizar('1001').subscribe((resultado) => {
      novoContratoNumero = resultado.novoContratoNumero ?? '';
    });

    const req = httpMock.expectOne('/assets/resultado-renegociacao.json');
    req.flush({
      aprovado: true,
      motivoRecusa: null,
      novoContratoNumero: 'AC-123',
    });

    expect(novoContratoNumero).toBe('AC-123');
  });

  it('deve usar endpoint do BFF quando ambiente for production', () => {
    (service as unknown as { isDev: boolean }).isDev = false;

    let contratoNumero = '';

    service.buscarContrato('1001').subscribe((contrato) => {
      contratoNumero = contrato.numero;
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'http://localhost:3000/api/renegociacao/contratos' &&
        request.params.get('termo') === '1001',
    );

    req.flush({
      data: {
        numero: '1001',
        cliente: 'Cliente 1',
        cpfCnpj: '123',
        produto: 'CDC',
        valorDevido: 10000,
        dataVencimento: '2026-01-01',
        status: 'APTO',
      },
    });

    expect(contratoNumero).toBe('1001');
  });
});
