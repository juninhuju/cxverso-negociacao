import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ResultadoComponent } from './resultado.component';

describe('ResultadoComponent', () => {
  const facadeMock = {
    loading: () => false,
    error: () => null,
    simulacao: () => null,
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    facadeMock.avancarStep.calls.reset();
    facadeMock.voltarStep.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ResultadoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('deve continuar para conclusão', () => {
    const fixture = TestBed.createComponent(ResultadoComponent);
    const component = fixture.componentInstance;

    component.continuar();

    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/conclusao']);
  });

  it('deve voltar para simulação', () => {
    const fixture = TestBed.createComponent(ResultadoComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/simulacao']);
  });
});
