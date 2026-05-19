import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
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
  let consultaAtual: { custasObrigatorias: number } | null = null;
  let simulacaoAtual: {
    valorEntrada: number;
    numeroParcelas: number;
    valorParcela: number;
    taxaJuros: number;
    totalPago: number;
    totalJuros: number;
    parcelas: readonly { numero: number; valor: number; vencimento: string }[];
  } | null = null;

  const facadeMock = {
    loading: () => false,
    error: () => null,
    simulacao: () => simulacaoAtual,
    contrato: () => contratoAtual,
    consultaJuridica: () => consultaAtual,
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
    consultaAtual = null;
    simulacaoAtual = null;
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
    })
      .overrideComponent(SimulacaoComponent, {
        set: { template: '' },
      })
      .compileComponents();
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

  testCase('deve aplicar fallback de opções quando API falhar', () => {
    contratoAtual = {
      numero: 'CN-2', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO'
    };
    apiMock.carregarOpcoesSimulacao.and.returnValue(throwError(() => new Error('erro')));

    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.opcoesDisponiveis()).toEqual([]);
  });

  testCase('deve normalizar taxa percentual', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    expect(component.taxaJurosPercentual({
      id: 1,
      descricao: 'x',
      valorEntrada: 1,
      numeroParcelas: 1,
      taxaJuros: 2,
      valorParcela: 1,
      economiaTotal: 0,
      detalhes: 'x',
    })).toBe(0.02);
  });

  testCase('deve atualizar valor de entrada com fallback e clamp', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.atualizarValorEntrada('10,5');
    expect(component.valorEntrada()).toBe(10.5);

    component.atualizarValorEntrada('abc');
    expect(component.valorEntrada()).toBe(0);

    component.atualizarValorEntrada(-100);
    expect(component.valorEntrada()).toBe(0);
  });

  testCase('deve atualizar número de parcelas com fallback e mínimo 1', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.atualizarNumeroParcelas('5,8');
    expect(component.numeroParcelas()).toBe(6);

    component.atualizarNumeroParcelas('');
    expect(component.numeroParcelas()).toBe(1);

    component.atualizarNumeroParcelas(0);
    expect(component.numeroParcelas()).toBe(1);
  });

  testCase('deve usar custas obrigatórias da consulta no saldo renegociado', () => {
    consultaAtual = { custasObrigatorias: 100 };
    contratoAtual = {
      numero: 'CN-3', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 1000, dataVencimento: '2026-01-01', status: 'APTO'
    };
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.selecionarOpcao({
      id: 2,
      descricao: '12x',
      valorEntrada: 200,
      numeroParcelas: 12,
      taxaJuros: 1,
      valorParcela: 100,
      economiaTotal: 50,
      detalhes: 'detalhes',
    });

    expect(component.saldoRenegociado()).toBe(1050);
  });

  testCase('deve restaurar valores da simulação existente no prefill', () => {
    contratoAtual = {
      numero: 'CN-4', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 1000, dataVencimento: '2026-01-01', status: 'APTO'
    };
    simulacaoAtual = {
      valorEntrada: 300,
      numeroParcelas: 6,
      valorParcela: 150,
      taxaJuros: 1,
      totalPago: 1200,
      totalJuros: 200,
      parcelas: [],
    };
    apiMock.carregarOpcoesSimulacao.and.returnValue(of({
      numeroContrato: 'CN-4',
      nomeCliente: 'A',
      opcoes: [
        {
          id: 3,
          descricao: '6x',
          valorEntrada: 300,
          numeroParcelas: 6,
          taxaJuros: 1,
          valorParcela: 150,
          economiaTotal: 20,
          detalhes: 'x',
        },
      ],
    }));

    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.valorEntrada()).toBe(300);
    expect(component.numeroParcelas()).toBe(6);
    expect(component.opcaoSelecionada()?.numeroParcelas).toBe(6);
  });

  testCase('deve simular com limites mínimos para valores inválidos', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.valorEntrada.set(-1);
    component.numeroParcelas.set(0);
    component.simular();

    expect(facadeMock.simular).toHaveBeenCalledWith(0, 1);
  });

  testCase('deve aplicar prefill da primeira opção quando não há simulação anterior', () => {
    contratoAtual = {
      numero: 'CN-5', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 1000, dataVencimento: '2026-01-01', status: 'APTO'
    };
    apiMock.carregarOpcoesSimulacao.and.returnValue(of({
      numeroContrato: 'CN-5',
      nomeCliente: 'A',
      opcoes: [
        {
          id: 10,
          descricao: '24x',
          valorEntrada: 400,
          numeroParcelas: 24,
          taxaJuros: 2,
          valorParcela: 120,
          economiaTotal: 80,
          detalhes: 'x',
        },
      ],
    }));

    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.opcaoSelecionada()?.id).toBe(10);
    expect(component.valorEntrada()).toBe(400);
    expect(component.numeroParcelas()).toBe(24);
  });

  testCase('deve calcular taxa dinâmica, parcela preview e juros sem simulação compatível', () => {
    contratoAtual = {
      numero: 'CN-6', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 1200, dataVencimento: '2026-01-01', status: 'APTO'
    };
    consultaAtual = { custasObrigatorias: 100 };

    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.selecionarOpcao({
      id: 20,
      descricao: '12x',
      valorEntrada: 200,
      numeroParcelas: 12,
      taxaJuros: 2,
      valorParcela: 100,
      economiaTotal: 50,
      detalhes: 'x',
    });

    expect(component.simulacaoCompativel()).toBeNull();
    expect(component.taxaJurosDinamica()).toBe(0.02);
    expect(component.parcelaMensalPreview()).toBeCloseTo(87.5, 2);
    expect(component.jurosValor()).toBeCloseTo(21, 2);
    expect(component.custasObrigatorias()).toBe(100);
  });

  testCase('deve usar valores da simulação quando compatível', () => {
    contratoAtual = {
      numero: 'CN-7', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 5000, dataVencimento: '2026-01-01', status: 'APTO'
    };
    simulacaoAtual = {
      valorEntrada: 300,
      numeroParcelas: 6,
      valorParcela: 999,
      taxaJuros: 1.5,
      totalPago: 7000,
      totalJuros: 250,
      parcelas: [],
    };

    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.simulacaoCompativel()).not.toBeNull();
    expect(component.parcelaMensalPreview()).toBe(999);
    expect(component.jurosValor()).toBe(250);
    expect(component.taxaJurosDinamica()).toBe(0.015);
  });

  testCase('deve usar default de custas e taxa quando não houver dados', () => {
    contratoAtual = {
      numero: 'CN-8', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 1000, dataVencimento: '2026-01-01', status: 'APTO'
    };

    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    expect(component.custasObrigatorias()).toBe(5090);
    expect(component.taxaJurosDinamica()).toBe(0.018);
    expect(component.cetTaxa()).toBeCloseTo(0.0218, 6);
    expect(component.cetValor()).toBeGreaterThan(0);
    expect(component.boletoUnico()).toBe(0);
    expect(component.colunasTabela).toEqual(['numero', 'vencimento', 'valor']);
  });
});
