// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato, ValidacaoOperacional } from '../../../models/renegociacao.model';
import { ValidacaoOperacionalComponent } from './validacao-operacional.component';

describe('ValidacaoOperacionalComponent', () => {
  let fixture: ComponentFixture<ValidacaoOperacionalComponent>;
  let component: ValidacaoOperacionalComponent;

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

  const validacaoMock: ValidacaoOperacional = {
    status: 'APROVADO',
    aptoParaRenegociacao: true,
    impedimentos: [],
    uploadAtendido: true,
    checksEtapasAnteriores: true,
    validadoEm: new Date().toISOString(),
  };

  const facadeMock = {
    stepAtual: signal(2),
    loading: signal(false),
    error: signal<string | null>(null),
    contrato: signal<Contrato | null>(contratoMock),
    validacaoOperacional: signal<ValidacaoOperacional | null>(validacaoMock),
    solicitarConsultaJuridica: jasmine.createSpy('solicitarConsultaJuridica'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(undefined),
    }),
  };

  const apiMock = {
    carregarDetalheContrato: jasmine.createSpy('carregarDetalheContrato').and.returnValue(
      of({
        id: 10,
        clienteId: 1,
        tipoContrato: 'Empréstimo Comercial',
        saldoDevedor: 85000,
        desconto: null,
        valorDesconto: null,
        saldoRenegociado: null,
        entradaNegociacao: null,
        entradaTotal: null,
        valorFinanciado: null,
        parcelaMinima: null,
        parcelaMaxima: null,
        jurosAoMesTaxa: null,
        iofTaxa: null,
        cet: null,
        possuiGarantia: true,
        quantidadeGarantias: 1,
        garantias: [
          {
            id: 1,
            tipo: 'IMOVEL',
            descricao: 'Sala comercial',
            valorGarantia: 100000,
            registroGarantia: 'Matrícula 18524-0',
          },
        ],
        statusDivida: 'EM_EXECUCAO_EXTRAJUDICIAL',
        statusNegociacao: 'EM_NEGOCIACAO',
        custasCartorarias: 1800,
        custas: 0,
        honorarios: 0,
      }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidacaoOperacionalComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: RenegociacaoApiService, useValue: apiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidacaoOperacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve prosseguir para simulação', () => {
    component.prosseguirSimulacao();

    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/simulacao']);
  });

  it('deve voltar para seleção', () => {
    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/selecionar']);
  });
});
