import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { OpcaoSimulacao } from '../../../models/renegociacao.model';
import { SimulacaoComponent } from './simulacao.component';

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

  it('deve carregar opções quando contrato existir', () => {
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

  it('deve selecionar opção e disparar simulação', () => {
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

  it('deve simular com os valores atuais', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;
    component.valorEntrada.set(700);
    component.numeroParcelas.set(24);

    component.simular();

    expect(facadeMock.simular).toHaveBeenCalledWith(700, 24);
  });

  it('deve avançar para resultado após timeout no continuar', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(SimulacaoComponent);
      const component = fixture.componentInstance;

      component.continuar();

      expect(facadeMock.simular).toHaveBeenCalled();
      expect(facadeMock.avancarStep).not.toHaveBeenCalled();

      jasmine.clock().tick(500);

      expect(facadeMock.avancarStep).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/resultado']);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('deve voltar para jurídico', () => {
    const fixture = TestBed.createComponent(SimulacaoComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });
});
