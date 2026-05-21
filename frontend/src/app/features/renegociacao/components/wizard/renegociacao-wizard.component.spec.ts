// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RenegociacaoFacade } from '../../../../states/renegociacao/renegociacao.facade';
import { RenegociacaoWizardComponent } from './renegociacao-wizard.component';

describe('RenegociacaoWizardComponent', () => {
  let fixture: ComponentFixture<RenegociacaoWizardComponent>;
  let component: RenegociacaoWizardComponent;

  const facadeMock = {
    stepAtual: signal(2),
    loading: signal(false),
    validarContratoElegibilidade: jasmine.createSpy('validarContratoElegibilidade'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenegociacaoWizardComponent],
      providers: [{ provide: RenegociacaoFacade, useValue: facadeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(RenegociacaoWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve calcular progresso conforme step atual', () => {
    expect(component.progressPercent).toBe(40);
  });

  it('deve delegar para o facade a validação de elegibilidade do contrato', () => {
    facadeMock.validarContratoElegibilidade.and.callFake((status: string) => status !== 'CEDIDO');
    expect(component.isContratoApto('APTO')).toBeTrue();
    expect(component.isContratoApto('CEDIDO')).toBeFalse();
    expect(facadeMock.validarContratoElegibilidade).toHaveBeenCalledWith('APTO');
    expect(facadeMock.validarContratoElegibilidade).toHaveBeenCalledWith('CEDIDO');
  });
});
