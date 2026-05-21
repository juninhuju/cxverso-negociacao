import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato } from '../../../models/renegociacao.model';
import { SelecionarContratoComponent } from './selecionar-contrato.component';

describe('SelecionarContratoComponent', () => {
  let fixture: ComponentFixture<SelecionarContratoComponent>;
  let component: SelecionarContratoComponent;

  const contratoMock: Contrato = {
    numero: '10',
    cliente: 'Maria da Silva',
    cpfCnpj: '12345678901',
    produto: 'Empréstimo Comercial',
    valorDevido: 85000,
    dataVencimento: '',
    status: 'INADIMPLENTE',
    diasAtraso: 45,
    garantia: 'SIM',
  };

  const facadeMock = {
    stepAtual: signal(1),
    loading: signal(false),
    error: signal<string | null>(null),
    contrato: signal<Contrato | null>(contratoMock),
    contratos: signal<Contrato[]>([contratoMock]),
    validarContratoElegibilidade: jasmine.createSpy('validarContratoElegibilidade').and.returnValue(true),
    definirContrato: jasmine.createSpy('definirContrato'),
    solicitarValidacaoOperacional: jasmine.createSpy('solicitarValidacaoOperacional'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecionarContratoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve selecionar contrato elegível e navegar', () => {
    component.selecionarContrato(contratoMock);

    expect(facadeMock.definirContrato).toHaveBeenCalledWith(contratoMock);
    expect(facadeMock.solicitarValidacaoOperacional).toHaveBeenCalledWith('10');
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });

  it('deve impedir seleção quando contrato não for elegível', () => {
    facadeMock.validarContratoElegibilidade.and.returnValue(false);

    component.selecionarContrato(contratoMock);

    expect(facadeMock.definirContrato).not.toHaveBeenCalled();
    expect(facadeMock.solicitarValidacaoOperacional).not.toHaveBeenCalled();
  });
});
