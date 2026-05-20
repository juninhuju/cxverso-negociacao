import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Contrato } from '../../renegociacao/models/renegociacao.model';
import { AcompanhamentoDashboardService, SolicitacaoAcompanhamento } from './acompanhamento-dashboard.service';

describe('AcompanhamentoDashboardService', () => {
  let service: AcompanhamentoDashboardService;
  let httpMock: HttpTestingController;

  const mockSolicitacoes: SolicitacaoAcompanhamento[] = [
    {
      id: '1',
      contratoCaixa: 'CN-001',
      cliente: 'João Silva',
      status: 'EM_ANDAMENTO',
      dataUltimo: '2026-05-20',
      cpfCnpj: '123.456.789-00',
      produto: 'CDC',
      protocolo: 'PR-001',
      valorTotalFormatado: 'R$ 50.000,00',
      numeroContrato: '12345', // Adicionado
      valorTotal: 50000, // Adicionado
      dataInicio: '2026-01-01', // Adicionado
    },
    {
      id: '2',
      contratoCaixa: 'CN-002',
      cliente: 'Maria Santos',
      status: 'CONCLUIDA',
      dataUltimo: '2026-05-19',
      cpfCnpj: '987.654.321-00',
      produto: 'Financiamento',
      protocolo: 'PR-002',
      valorTotalFormatado: 'R$ 100.000,00',
      numeroContrato: '67890', // Adicionado
      valorTotal: 100000, // Adicionado
      dataInicio: '2026-02-01', // Adicionado
    },
  ];

  const mockContratos: Contrato[] = [
    {
      numero: 'CN-001',
      cliente: 'João Silva',
      cpfCnpj: '123.456.789-00',
      produto: 'CDC',
      valorDevido: 50000,
      dataVencimento: '2026-12-31',
      status: 'APTO',
    },
    {
      numero: 'CN-002',
      cliente: 'Maria Santos',
      cpfCnpj: '987.654.321-00',
      produto: 'Financiamento',
      valorDevido: 100000,
      dataVencimento: '2026-12-31',
      status: 'APTO',
    },
    {
      numero: 'CN-003',
      cliente: 'Pedro Oliveira',
      cpfCnpj: '111.222.333-44',
      produto: 'Empréstimo',
      valorDevido: 25000,
      dataVencimento: '2026-12-31',
      status: 'INADIMPLENTE',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AcompanhamentoDashboardService],
    });

    service = TestBed.inject(AcompanhamentoDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica se não há requisições pendentes
  });

  // ===================== TESTES DE LISTAR SOLICITAÇÕES =====================

  it('deve criar o service', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar solicitações com sucesso', (done) => {
    service.listarSolicitacoes().subscribe((solicitacoes) => {
      expect(solicitacoes.length).toBe(2);
      expect(solicitacoes[0].protocolo).toBe('PR-001');
      expect(solicitacoes[1].protocolo).toBe('PR-002');
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSolicitacoes);
  });

  it('deve retornar lista vazia em caso de erro ao listar', (done) => {
    service.listarSolicitacoes().subscribe((solicitacoes) => {
      expect(solicitacoes.length).toBe(0);
      expect(solicitacoes).toEqual([]);
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('deve fazer requisição GET ao listar solicitações', (done) => {
    service.listarSolicitacoes().subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSolicitacoes);
  });

  it('deve retornar tipo correto de solicitações', (done) => {
    service.listarSolicitacoes().subscribe((solicitacoes) => {
      expect(solicitacoes).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({
          protocolo: jasmine.any(String),
          cliente: jasmine.any(String),
          status: jasmine.any(String),
        }),
      ]));
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    req.flush(mockSolicitacoes);
  });

  it('deve conter informações de protocolo nas solicitações', (done) => {
    service.listarSolicitacoes().subscribe((solicitacoes) => {
      solicitacoes.forEach((sol) => {
        expect(sol.protocolo).toBeDefined();
        expect(sol.cpfCnpj).toBeDefined();
        expect(sol.produto).toBeDefined();
      });
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    req.flush(mockSolicitacoes);
  });

  // ===================== TESTES DE BUSCAR CONTRATOS =====================

  it('deve buscar contratos por documento (CPF)', (done) => {
    const documento = '123.456.789-00';
    service.buscarContratosPorDocumento(documento).subscribe((contratos) => {
      expect(contratos.length).toBe(1);
      expect(contratos[0].cliente).toBe('João Silva');
      expect(contratos[0].cpfCnpj).toBe('123.456.789-00');
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockContratos);
  });

  it('deve buscar múltiplos contratos do mesmo cliente', (done) => {
    const contratosMultiplos: Contrato[] = [
      ...mockContratos,
      {
        numero: 'CN-004',
        cliente: 'João Silva',
        cpfCnpj: '123.456.789-00',
        produto: 'Financiamento Adicional',
        valorDevido: 30000,
        dataVencimento: '2026-12-31',
        status: 'APTO',
      },
    ];

    const documento = '123.456.789-00';
    service.buscarContratosPorDocumento(documento).subscribe((contratos) => {
      expect(contratos.length).toBe(2);
      expect(contratos.every((c) => c.cpfCnpj === '123.456.789-00')).toBe(true);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(contratosMultiplos);
  });

  it('deve retornar lista vazia ao buscar documento inexistente', (done) => {
    const documento = '999.999.999-99';
    service.buscarContratosPorDocumento(documento).subscribe((contratos) => {
      expect(contratos.length).toBe(0);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });

  it('deve retornar lista vazia em caso de erro na busca de contratos', (done) => {
    service.buscarContratosPorDocumento('123.456.789-00').subscribe((contratos) => {
      expect(contratos.length).toBe(0);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('deve fazer requisição GET ao buscar contratos', (done) => {
    service.buscarContratosPorDocumento('123.456.789-00').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockContratos);
  });

  // ===================== TESTES DE NORMALIZAÇÃO =====================

  it('deve normalizar documento removendo caracteres especiais', (done) => {
    const documento = '123.456.789-00'; // Com pontos e hífen
    service.buscarContratosPorDocumento(documento).subscribe((contratos) => {
      // O serviço normaliza internamente
      expect(contratos.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });

  it('deve encontrar contrato com CPF sem formatação', (done) => {
    const documentoSemFormatacao = '12345678900';
    service.buscarContratosPorDocumento(documentoSemFormatacao).subscribe((contratos) => {
      expect(contratos.length).toBe(1);
      expect(contratos[0].cliente).toBe('João Silva');
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });

  it('deve encontrar contrato mesmo com formatações diferentes', (done) => {
    const documentos = [
      '123.456.789-00',
      '123456789-00',
      '123.45678900',
      '12345678900',
    ];

    let completados = 0;

    documentos.forEach((doc) => {
      service.buscarContratosPorDocumento(doc).subscribe((contratos) => {
        expect(contratos.length).toBeGreaterThan(0);
        completados++;
        if (completados === documentos.length) {
          done();
        }
      });
    });

    const reqs = httpMock.match('/assets/contratos.json');
    reqs.forEach((req) => {
      req.flush(mockContratos);
    });
  });

  // ===================== TESTES DE TRATAMENTO DE ERRO =====================

  it('deve recuperar com lista vazia ao falhar requisição', (done) => {
    service.listarSolicitacoes().subscribe((result) => {
      expect(result).toEqual([]);
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    req.error(new ErrorEvent('Erro de rede'));
  });

  it('deve continuar após erro em buscarContratosPorDocumento', (done) => {
    service.buscarContratosPorDocumento('123').subscribe((result) => {
      expect(result).toEqual([]);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.error(new ErrorEvent('Erro'));
  });

  it('deve não lançar exceção ao tratar erro', (done) => {
    expect(() => {
      service.listarSolicitacoes().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
      req.error(new ErrorEvent('Erro'));
    }).not.toThrow();
  });

  // ===================== TESTES DE FLUXO COMPLETO =====================

  it('deve buscar e listar solicitações sem interferência', (done) => {
    let contaRequisicoes = 0;
    let totalSolicitacoes = 0;
    let totalContratos = 0;

    service.listarSolicitacoes().subscribe((solicitacoes) => {
      totalSolicitacoes = solicitacoes.length;
      contaRequisicoes++;
    });

    service.buscarContratosPorDocumento('123.456.789-00').subscribe((contratos) => {
      totalContratos = contratos.length;
      contaRequisicoes++;
      if (contaRequisicoes === 2) {
        expect(totalSolicitacoes).toBeGreaterThan(0);
        expect(totalContratos).toBeGreaterThan(0);
        done();
      }
    });

    const reqSolicitacoes = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    const reqContratos = httpMock.expectOne('/assets/contratos.json');

    reqSolicitacoes.flush(mockSolicitacoes);
    reqContratos.flush(mockContratos);
  });

  it('deve permitir múltiplas buscas de contrato', (done) => {
    let contaRequisicoes = 0;

    service.buscarContratosPorDocumento('123').subscribe(() => {
      contaRequisicoes++;
    });

    service.buscarContratosPorDocumento('987').subscribe(() => {
      contaRequisicoes++;
      if (contaRequisicoes === 2) {
        done();
      }
    });

    const reqs = httpMock.match('/assets/contratos.json');
    expect(reqs.length).toBe(2);

    reqs[0].flush(mockContratos);
    reqs[1].flush(mockContratos);
  });

  // ===================== TESTES DE ESTRUTURA DE DADOS =====================

  it('deve retornar solicitações com todos os campos obrigatórios', (done) => {
    service.listarSolicitacoes().subscribe((solicitacoes) => {
      solicitacoes.forEach((sol) => {
        expect(sol.id).toBeDefined();
        expect(sol.cliente).toBeDefined();
        expect(sol.status).toBeDefined();
        expect(sol.protocolo).toBeDefined();
        expect(sol.cpfCnpj).toBeDefined();
        expect(sol.produto).toBeDefined();
      });
      done();
    });

    const req = httpMock.expectOne('/assets/solicitacoes-acompanhamento.json');
    req.flush(mockSolicitacoes);
  });

  it('deve retornar contratos com todos os campos obrigatórios', (done) => {
    service.buscarContratosPorDocumento('123.456.789-00').subscribe((contratos) => {
      expect(contratos.length).toBeGreaterThan(0);
      contratos.forEach((contrato) => {
        expect(contrato.numero).toBeDefined();
        expect(contrato.cliente).toBeDefined();
        expect(contrato.cpfCnpj).toBeDefined();
        expect(contrato.status).toBeDefined();
      });
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });

  // ===================== TESTES DE FILTRO =====================

  it('deve filtrar apenas contratos do documento solicitado', (done) => {
    service.buscarContratosPorDocumento('123.456.789-00').subscribe((contratos) => {
      expect(contratos.length).toBeGreaterThan(0);
      contratos.forEach((contrato) => {
        expect(contrato.cpfCnpj.replace(/\D/g, '')).toBe('12345678900');
      });
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });

  it('deve não retornar contratos de outros documentos', (done) => {
    service.buscarContratosPorDocumento('123.456.789-00').subscribe((contratos) => {
      const outrosDocumentos = contratos.filter((c) => c.cpfCnpj === '987.654.321-00');
      expect(outrosDocumentos.length).toBe(0);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });

  it('deve manter ordem dos contratos após filtro', (done) => {
    const contratosFiltrados = mockContratos.filter((c) => c.cpfCnpj.includes('123'));

    service.buscarContratosPorDocumento('123.456.789-00').subscribe((contratos) => {
      expect(contratos[0].numero).toBe(contratosFiltrados[0].numero);
      done();
    });

    const req = httpMock.expectOne('/assets/contratos.json');
    req.flush(mockContratos);
  });
});
