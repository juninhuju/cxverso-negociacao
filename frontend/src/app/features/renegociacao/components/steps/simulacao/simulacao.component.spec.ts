import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { ConsultaJuridica, Contrato, OpcaoSimulacao, SimulacaoRenegociacao } from '../../../models/renegociacao.model';
import { SimulacaoComponent } from './simulacao.component';

describe('SimulacaoComponent', () => {
  let fixture: ComponentFixture<SimulacaoComponent>;
  let component: SimulacaoComponent;

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
    custasObrigatorias: 100,
    validadoEm: new Date().toISOString(),
  };

  const simulacaoMock: SimulacaoRenegociacao = {
    valorEntrada: 1000,
    numeroParcelas: 12,
    valorParcela: 500,
    taxaJuros: 0.0199,
    totalPago: 7000,
    totalJuros: 1200,
    parcelas: [],
  };

  const opcaoMock: OpcaoSimulacao = {
    id: 1,
    descricao: '12 parcelas',
    valorEntrada: 1000,
    numeroParcelas: 12,
    taxaJuros: 0.0199,
    valorParcela: 500,
    economiaTotal: 100,
    detalhes: 'Plano em 12x',
  };

  const facadeMock = {
    stepAtual: signal(3),
    loading: signal(false),
    error: signal<string | null>(null),
    simulacao: signal<SimulacaoRenegociacao | null>(simulacaoMock),
    contrato: signal<Contrato | null>(contratoMock),
    consultaJuridica: signal<ConsultaJuridica | null>(consultaMock),
    simular: jasmine.createSpy('simular'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const apiMock = {
    carregarOpcoesSimulacao: jasmine.createSpy('carregarOpcoesSimulacao').and.returnValue(
      of({ numeroContrato: '10', nomeCliente: 'Maria da Silva', opcoes: [opcaoMock] }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulacaoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: RenegociacaoApiService, useValue: apiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar simular com entrada e parcelas atualizadas', () => {
    component.valorEntrada.set(1500);
    component.numeroParcelas.set(18);

    component.simular();

    expect(facadeMock.simular).toHaveBeenCalledWith(1500, 18);
  });

  it('deve seguir para resultado ao continuar', () => {
    component.continuar();

    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/resultado']);
  });
});
