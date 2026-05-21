// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConsultaJuridica, Contrato, SimulacaoRenegociacao } from '../../../models/renegociacao.model';
import { ResultadoComponent } from './resultado.component';

describe('ResultadoComponent', () => {
  let fixture: ComponentFixture<ResultadoComponent>;
  let component: ResultadoComponent;

  const contratoMock: Contrato = {
    numero: '10',
    cliente: 'Maria da Silva',
    cpfCnpj: '12345678901',
    produto: 'Empréstimo Comercial',
    valorDevido: 85000,
    dataVencimento: '',
    status: 'INADIMPLENTE',
  };

  const consultaMock: ConsultaJuridica = {
    solicitacaoId: 'CJ-10',
    status: 'APROVADO',
    parecer: null,
    custasObrigatorias: 1800,
    validadoEm: new Date().toISOString(),
  };

  const simulacaoMock: SimulacaoRenegociacao = {
    valorEntrada: 1000,
    numeroParcelas: 12,
    valorParcela: 500,
    taxaJuros: 0.0199,
    totalPago: 7000,
    totalJuros: -1237.15,
    parcelas: [],
  };

  const facadeMock = {
    stepAtual: signal(4),
    loading: signal(false),
    error: signal<string | null>(null),
    contrato: signal<Contrato | null>(contratoMock),
    consultaJuridica: signal<ConsultaJuridica | null>(consultaMock),
    simulacao: signal<SimulacaoRenegociacao | null>(simulacaoMock),
    formalizar: jasmine.createSpy('formalizar'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ResultadoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve expor valor de juros sempre positivo', () => {
    expect(component.jurosValorPositivo()).toBe(1237.15);
  });

  it('deve formalizar e navegar para conclusão ao continuar', () => {
    component.continuar();

    expect(facadeMock.formalizar).toHaveBeenCalled();
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/conclusao']);
    expect(localStorage.getItem('negocia_caixa_historico')).toContain('CONCLUIDA');
  });
});
