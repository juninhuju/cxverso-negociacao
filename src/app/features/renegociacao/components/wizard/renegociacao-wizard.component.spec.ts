import { TestBed } from '@angular/core/testing';
import { RenegociacaoFacade } from '../../../../states/renegociacao/renegociacao.facade';
import { RenegociacaoWizardComponent } from './renegociacao-wizard.component';

const testCase = (globalThis as unknown as {
  it: (description: string, specFn: () => void) => void;
}).it;

describe('RenegociacaoWizardComponent', () => {
  let currentStep = 0;

  const facadeMock = {
    stepAtual: () => currentStep,
    loading: () => false,
  };

  beforeEach(async () => {
    currentStep = 0;

    await TestBed.configureTestingModule({
      imports: [RenegociacaoWizardComponent],
      providers: [{ provide: RenegociacaoFacade, useValue: facadeMock }],
    }).compileComponents();
  });

  testCase('deve expor os 5 steps esperados', () => {
    const fixture = TestBed.createComponent(RenegociacaoWizardComponent);
    const component = fixture.componentInstance;

    expect(component.steps.length).toBe(5);
  });

  testCase('deve calcular progresso em 0% no primeiro step', () => {
    const fixture = TestBed.createComponent(RenegociacaoWizardComponent);
    const component = fixture.componentInstance;

    currentStep = 0;
    expect(component.progressPercent).toBe(0);
  });

  testCase('deve calcular progresso corretamente para step intermediário', () => {
    const fixture = TestBed.createComponent(RenegociacaoWizardComponent);
    const component = fixture.componentInstance;

    currentStep = 4;
    expect(component.progressPercent).toBe(67);
  });
});
