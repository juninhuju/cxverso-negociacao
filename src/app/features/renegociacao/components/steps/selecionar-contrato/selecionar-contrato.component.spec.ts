import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { SelecionarContratoComponent } from './selecionar-contrato.component';

describe('SelecionarContratoComponent', () => {
  let contratoAtual: {
    numero: string;
    cliente: string;
    cpfCnpj: string;
    produto: string;
    valorDevido: number;
    dataVencimento: string;
    status: 'APTO' | 'CEDIDO';
  } | null = null;

  const facadeMock = {
    loading: () => false,
    error: () => null,
    contrato: () => contratoAtual,
    validarContratoElegibilidade: jasmine.createSpy('validarContratoElegibilidade').and.returnValue(true),
    definirContrato: jasmine.createSpy('definirContrato'),
    solicitarValidacaoOperacional: jasmine.createSpy('solicitarValidacaoOperacional'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const httpMock = {
    get: jasmine.createSpy('get').and.returnValue(of([])),
  };

  beforeEach(async () => {
    contratoAtual = null;
    facadeMock.validarContratoElegibilidade.calls.reset();
    facadeMock.validarContratoElegibilidade.and.returnValue(true);
    facadeMock.definirContrato.calls.reset();
    facadeMock.solicitarValidacaoOperacional.calls.reset();
    facadeMock.avancarStep.calls.reset();
    facadeMock.voltarStep.calls.reset();
    routerMock.navigate.calls.reset();
    httpMock.get.calls.reset();

    await TestBed.configureTestingModule({
      imports: [SelecionarContratoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: HttpClient, useValue: httpMock },
      ],
    }).compileComponents();
  });

  it('não deve confirmar sem contrato', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    component.confirmar();

    expect(facadeMock.validarContratoElegibilidade).not.toHaveBeenCalled();
    expect(facadeMock.solicitarValidacaoOperacional).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('não deve avançar quando contrato não for elegível', () => {
    contratoAtual = {
      numero: 'C1', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'CEDIDO'
    };
    facadeMock.validarContratoElegibilidade.and.returnValue(false);

    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    component.confirmar();

    expect(facadeMock.validarContratoElegibilidade).toHaveBeenCalledWith('CEDIDO');
    expect(facadeMock.solicitarValidacaoOperacional).not.toHaveBeenCalled();
    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve solicitar validação operacional e navegar quando elegível', () => {
    contratoAtual = {
      numero: 'C2', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO'
    };

    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    component.confirmar();

    expect(facadeMock.validarContratoElegibilidade).toHaveBeenCalledWith('APTO');
    expect(facadeMock.solicitarValidacaoOperacional).toHaveBeenCalledWith('C2');
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });

  it('deve voltar para busca', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/busca']);
  });

  it('deve selecionar contrato e navegar quando elegível', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    const escolhido = {
      numero: 'C3', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 50, dataVencimento: '2026-01-01', status: 'APTO' as const
    };

    component.selecionarContrato(escolhido);

    expect(facadeMock.definirContrato).toHaveBeenCalledWith(escolhido);
    expect(facadeMock.solicitarValidacaoOperacional).toHaveBeenCalledWith('C3');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });

  it('não deve selecionar contrato inelegível', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;
    facadeMock.validarContratoElegibilidade.and.returnValue(false);

    const escolhido = {
      numero: 'C4', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 50, dataVencimento: '2026-01-01', status: 'CEDIDO' as const
    };

    component.selecionarContrato(escolhido);

    expect(facadeMock.definirContrato).not.toHaveBeenCalled();
    expect(facadeMock.solicitarValidacaoOperacional).not.toHaveBeenCalled();
  });

  it('deve calcular classe de atraso e status', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    expect(component.obterClasseDiasAtraso()).toBe('atraso-badge--normal');
    expect(component.obterClasseDiasAtraso(30)).toBe('atraso-badge--atencao');
    expect(component.obterClasseDiasAtraso(120)).toBe('atraso-badge--critico');
    expect(component.getStatusClasse('CEDIDO')).toBe('cedido');
    expect(component.formatarStatus('APTO')).toBe('Apto');
  });

  it('deve formatar moeda em pt-BR', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    const valor = component.formatarMoeda(1234.5);

    expect(valor).toContain('1.234');
  });

  it('deve calcular contratos do cliente, totais e contrato crítico por dias de atraso', () => {
    contratoAtual = {
      numero: 'C10', cliente: 'A', cpfCnpj: '111', produto: 'CDC', valorDevido: 100, dataVencimento: '2026-01-01', status: 'APTO'
    };
    httpMock.get.and.returnValue(
      of([
        {
          numero: 'C10', cliente: 'A', cpfCnpj: '111', produto: 'CDC', valorDevido: 100, dataVencimento: '2026-01-01', status: 'APTO', diasAtraso: 10,
        },
        {
          numero: 'C11', cliente: 'A', cpfCnpj: '111', produto: 'CDC', valorDevido: 250, dataVencimento: '2026-01-01', status: 'APTO', diasAtraso: 120,
        },
        {
          numero: 'C99', cliente: 'B', cpfCnpj: '999', produto: 'CDC', valorDevido: 999, dataVencimento: '2026-01-01', status: 'APTO', diasAtraso: 999,
        },
      ]),
    );

    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.totalContratos()).toBe(2);
    expect(component.totalSaldoDevedor()).toBe(350);
    expect(component.contratoMaisCritico()?.numero).toBe('C11');
    expect(component.isContratoCritico(component.contratosCliente()[0]!)).toBeTrue();
    expect(component.isContratoCritico(component.contratosCliente()[1]!)).toBeFalse();
  });

  it('deve retornar lista vazia quando não houver contrato atual', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    expect(component.contratosCliente()).toEqual([]);
    expect(component.totalContratos()).toBe(0);
    expect(component.totalSaldoDevedor()).toBe(0);
    expect(component.contratoMaisCritico()).toBeNull();
  });

  it('deve delegar elegibilidade e aplicar defaults de mapeamento', () => {
    const fixture = TestBed.createComponent(SelecionarContratoComponent);
    const component = fixture.componentInstance;

    const elegivel = component.isContratoElegivel({
      numero: 'C5', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 50, dataVencimento: '2026-01-01', status: 'APTO'
    });

    expect(elegivel).toBeTrue();
    expect(component.formatarStatus('STATUS_X')).toBe('STATUS_X');
    expect(component.getStatusClasse('STATUS_X')).toBe('');
  });
});
