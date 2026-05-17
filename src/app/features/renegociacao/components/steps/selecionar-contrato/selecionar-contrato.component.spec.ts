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
});
