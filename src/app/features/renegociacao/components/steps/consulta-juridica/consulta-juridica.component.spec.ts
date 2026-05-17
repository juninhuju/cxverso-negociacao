import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConsultaJuridicaComponent } from './consulta-juridica.component';

const testCase = (globalThis as unknown as {
  it: (description: string, specFn: () => void | Promise<void>) => void;
}).it;

describe('ConsultaJuridicaComponent', () => {
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
    consultaJuridica: () => null,
    solicitarConsultaJuridica: jasmine.createSpy('solicitarConsultaJuridica'),
    avancarStep: jasmine.createSpy('avancarStep'),
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
    routerMock.navigate.calls.reset();
    dialogMock.open.calls.reset();
    dialogMock.open.and.returnValue({
      afterClosed: () => of('voltar'),
    });

    await TestBed.configureTestingModule({
      imports: [ConsultaJuridicaComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();
  });

  testCase('deve redirecionar para validação quando não houver contrato', async () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    await component.ngOnInit();

    expect(dialogMock.open).not.toHaveBeenCalled();
    expect(facadeMock.solicitarConsultaJuridica).not.toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });

  testCase('deve avançar para simulação quando o dialog retornar continuar', async () => {
    contratoAtual = {
      numero: 'CN-1',
      cliente: 'Cliente',
      cpfCnpj: '123',
      produto: 'CDC',
      valorDevido: 100,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    };
    dialogMock.open.and.returnValue({
      afterClosed: () => of('continuar'),
    });

    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    await component.ngOnInit();

    expect(facadeMock.solicitarConsultaJuridica).toHaveBeenCalledWith('CN-1');
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/simulacao']);
  });

  testCase('deve voltar para validação quando o dialog não retornar continuar', async () => {
    contratoAtual = {
      numero: 'CN-1',
      cliente: 'Cliente',
      cpfCnpj: '123',
      produto: 'CDC',
      valorDevido: 100,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    };
    dialogMock.open.and.returnValue({
      afterClosed: () => of('voltar'),
    });

    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    await component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/validacao']);
  });
});
