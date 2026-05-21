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
});
