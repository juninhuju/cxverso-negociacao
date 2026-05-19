import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ValidacaoOperacionalComponent } from './validacao-operacional.component';

describe('ValidacaoOperacionalComponent', () => {
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
    contrato: () => contratoAtual,
    validacaoOperacional: () => null,
    solicitarConsultaJuridica: jasmine.createSpy('solicitarConsultaJuridica'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const dialogMock = {
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    contratoAtual = null;
    facadeMock.solicitarConsultaJuridica.calls.reset();
    facadeMock.avancarStep.calls.reset();
    facadeMock.voltarStep.calls.reset();
    routerMock.navigate.calls.reset();
    dialogMock.open.calls.reset();
    dialogMock.open.and.returnValue({ afterClosed: () => of('continuar') });

    await TestBed.configureTestingModule({
      imports: [ValidacaoOperacionalComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();
  });

  it('não deve continuar sem contrato', () => {
    const fixture = TestBed.createComponent(ValidacaoOperacionalComponent);
    const component = fixture.componentInstance;

    component.continuar();

    expect(facadeMock.solicitarConsultaJuridica).not.toHaveBeenCalled();
    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve solicitar consulta jurídica e avançar quando há contrato', async () => {
    contratoAtual = {
      numero: 'CN-1', cliente: 'A', cpfCnpj: '1', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO'
    };
    const fixture = TestBed.createComponent(ValidacaoOperacionalComponent);
    const component = fixture.componentInstance;

    await component.abrirConsultaJuridica();

    expect(facadeMock.solicitarConsultaJuridica).toHaveBeenCalledWith('CN-1');
    expect(dialogMock.open).toHaveBeenCalled();
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/simulacao']);
  });

  it('deve voltar para selecionar', () => {
    const fixture = TestBed.createComponent(ValidacaoOperacionalComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/selecionar']);
  });
});
