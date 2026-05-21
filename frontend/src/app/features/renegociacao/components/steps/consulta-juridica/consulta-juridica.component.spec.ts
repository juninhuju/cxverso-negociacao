import { signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConsultaJuridica, Contrato } from '../../../models/renegociacao.model';
import { ConsultaJuridicaComponent } from './consulta-juridica.component';

describe('ConsultaJuridicaComponent', () => {
  let fixture: ComponentFixture<ConsultaJuridicaComponent>;
  let component: ConsultaJuridicaComponent;

  const contratoMock: Contrato = {
    numero: '10',
    cliente: 'Maria da Silva',
    cpfCnpj: '12345678901',
    produto: 'Empréstimo Comercial',
    valorDevido: 85000,
    dataVencimento: '',
    status: 'INADIMPLENTE',
  };

  const consultaMock: ConsultaJuridica = {
    solicitacaoId: 'CJ-10',
    status: 'APROVADO',
    parecer: null,
    custasObrigatorias: 1800,
    validadoEm: new Date().toISOString(),
  };

  const facadeMock = {
    loading: signal(false),
    error: signal<string | null>(null),
    contrato: signal<Contrato | null>(contratoMock),
    consultaJuridica: signal<ConsultaJuridica | null>(consultaMock),
    solicitarConsultaJuridica: jasmine.createSpy('solicitarConsultaJuridica'),
  };

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaJuridicaComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { contrato: contratoMock } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar modo de edição', () => {
    component.alternarEdicao();
    expect(component.modoEdicao).toBeTrue();

    component.alternarEdicao();
    expect(component.modoEdicao).toBeFalse();
  });

  it('deve fechar diálogo ao enviar consulta', fakeAsync(() => {
    component.enviarConsulta();

    tick(1500);
    expect(dialogRefMock.close).toHaveBeenCalled();
  }));
});
