import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expectNoSeriousA11yViolations } from '../../../../../../testing/axe-accessibility';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ResultadoComponent } from './resultado.component';

describe('ResultadoComponent A11y', () => {
  const facadeMock = {
    stepAtual: signal(4),
    loading: signal(false),
    error: signal<string | null>(null),
    contrato: signal(null),
    consultaJuridica: signal(null),
    simulacao: signal(null),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('deve atender regras WCAG A/AA sem violacoes graves', async () => {
    const fixture = TestBed.createComponent(ResultadoComponent);
    fixture.detectChanges();

    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
