import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { OpcaoSimulacao } from '../../../models/renegociacao.model';
import { SimulacaoComponent } from './simulacao.component';

const testCase = (globalThis as unknown as {
  it: (description: string, specFn: () => void) => void;
}).it;

describe('SimulacaoComponent', () => {
  let contratoAtual: {
    numero: string;
    cliente: string;
    cpfCnpj: string;
    produto: string;
    valorDevido: number;
    dataVencimento: string;
    status: 'APTO';
  } | null = null;

  const facadeMock = {
    loading: () => false,
    error: () => null,
    simulacao: () => null,
    contrato: () => contratoAtual,
    consultaJuridica: () => null,
    simular: jasmine.createSpy('simular'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const apiMock = {
    carregarOpcoesSimulacao: jasmine.createSpy('carregarOpcoesSimulacao'),
  };

  beforeEach(async () => {
    contratoAtual = null;
    facadeMock.simular.calls.reset();
    facadeMock.avancarStep.calls.reset();
    facadeMock.voltarStep.calls.reset();
    routerMock.navigate.calls.reset();
    apiMock.carregarOpcoesSimulacao.calls.reset();
    apiMock.carregarOpcoesSimulacao.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [SimulacaoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: RenegociacaoApiService, useValue: apiMock },
      ],
    }).compileComponents();
  });

  testCase('deve carregar opções quando contrato existir', () => {
    contratoAtual = {
      numero: 'CN-1', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO'
    };
    apiMock.carregarOpcoesSimulacao.and.returnValue(of({
      numeroContrato: 'CN-1',
      nomeCliente: 'A',
      opcoes: [],
    }));

    const fixture = TestBed.createComponent(SimulacaoComponent);
    fixture.detectChanges();

    expect(apiMock.carregarOpcoesSimulacao).toHaveBeenCalledWith('CN-1');
  });

  testCase('deve selecionar opção e disparar simulação', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    const opcao: OpcaoSimulacao = {
      id: 1,
      descricao: '12x',
      valorEntrada: 500,
      numeroParcelas: 12,
      taxaJuros: 1,
      valorParcela: 100,
      economiaTotal: 50,
      detalhes: 'detalhes',
    };

    component.selecionarOpcao(opcao);

    expect(component.opcaoSelecionada()).toEqual(opcao);
    expect(component.valorEntrada()).toBe(500);
    expect(component.numeroParcelas()).toBe(12);
    expect(facadeMock.simular).toHaveBeenCalledWith(500, 12);
  });

  testCase('deve simular com os valores atuais', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    component.valorEntrada.set(700);
    component.numeroParcelas.set(24);

    component.simular();

    expect(facadeMock.simular).toHaveBeenCalledWith(700, 24);
  });

  testCase('deve avançar para resultado ao continuar', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.continuar();

    expect(facadeMock.simular).toHaveBeenCalled();
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/resultado']);
  });

  testCase('deve voltar para jurídico', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });
});
