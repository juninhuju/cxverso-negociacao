import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { AcompanhamentoDashboardService } from './acompanhamento-dashboard.service';

describe('AcompanhamentoDashboardService', () => {
  let service: AcompanhamentoDashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AcompanhamentoDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar solicitações da API', () => {
    const result: unknown[] = [];

    service.listarSolicitacoes().subscribe((res) => result.push(...res));

    const req = httpMock.expectOne(`${environment.bffUrl}/negociacao/negociacoes`);
    req.flush([
      {
        id: '1',
        numeroContrato: '10',
        cliente: 'Maria da Silva',
        valorTotal: 1000,
        dataInicio: '2026-01-01T00:00:00',
        status: 'CONCLUIDA',
        cpfCnpj: '123',
        produto: 'Emprestimo',
        protocolo: 'P-1',
        valorTotalFormatado: 'R$ 1.000,00',
        contratoCaixa: '10',
        dataUltimo: '2026-01-01T00:00:00',
      },
    ]);

    expect(result.length).toBe(1);
  });

  it('deve retornar localStorage quando API falhar', () => {
    localStorage.setItem(
      'negocia_caixa_historico',
      JSON.stringify([
        {
          id: '1',
          numeroContrato: '10',
          cliente: 'Maria',
          valorTotal: 100,
          dataInicio: '2026-01-01T00:00:00',
          status: 'CONCLUIDA',
          cpfCnpj: '123',
          produto: 'X',
          protocolo: 'P-1',
          valorTotalFormatado: 'R$ 100,00',
          contratoCaixa: '10',
          dataUltimo: '2026-01-01T00:00:00',
        },
      ]),
    );

    const out: unknown[] = [];
    service.listarSolicitacoes().subscribe((res) => out.push(...res));

    const req = httpMock.expectOne(`${environment.bffUrl}/negociacao/negociacoes`);
    req.flush({}, { status: 500, statusText: 'Server error' });

    expect(out.length).toBe(1);
  });
});
