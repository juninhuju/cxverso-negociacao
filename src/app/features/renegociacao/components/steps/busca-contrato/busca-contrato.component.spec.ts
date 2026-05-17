import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { BuscaContratoComponent } from './busca-contrato.component';

describe('BuscaContratoComponent', () => {
  const errorSignal = signal<string | null>(null);
  const contratoSignal = signal<{
    numero: string;
    cliente: string;
    cpfCnpj: string;
    produto: string;
    valorDevido: number;
    dataVencimento: string;
    status: 'APTO';
  } | null>(null);

  const facadeMock = {
    loading: () => false,
    error: errorSignal,
    contrato: contratoSignal,
    buscarContrato: jasmine.createSpy('buscarContrato'),
    avancarStep: jasmine.createSpy('avancarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    facadeMock.buscarContrato.calls.reset();
    facadeMock.avancarStep.calls.reset();
    routerMock.navigate.calls.reset();
    errorSignal.set(null);
    contratoSignal.set(null);

    await TestBed.configureTestingModule({
      imports: [BuscaContratoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  it('deve calcular máscara vazia para até 9 dígitos', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('123456789');

    expect(component.mascaraDocumento()).toBe('');
  });

  it('deve calcular máscara CPF para até 11 dígitos', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('12345678901');

    expect(component.mascaraDocumento()).toBe('000.000.000-00');
  });

  it('deve calcular máscara CNPJ para mais de 11 dígitos', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('12345678901234');

    expect(component.mascaraDocumento()).toBe('00.000.000/0000-00');
  });

  it('não deve buscar com termo vazio', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('   ');
    component.buscar();

    expect(facadeMock.buscarContrato).not.toHaveBeenCalled();
    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve disparar busca via facade', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange(' 123 ');
    component.buscar();

    expect(facadeMock.buscarContrato).toHaveBeenCalledWith('123');
    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
