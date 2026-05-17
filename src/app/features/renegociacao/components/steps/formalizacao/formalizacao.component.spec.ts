import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { FormalizacaoComponent } from './formalizacao.component';

describe('FormalizacaoComponent', () => {
  const facadeMock = {
    loading: () => false,
    contrato: () => null,
    simulacao: () => null,
    formalizar: jasmine.createSpy('formalizar'),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    facadeMock.formalizar.calls.reset();
    facadeMock.avancarStep.calls.reset();
    facadeMock.voltarStep.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [FormalizacaoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('deve formalizar e navegar para sucesso', () => {
    const fixture = TestBed.createComponent(FormalizacaoComponent);
    const component = fixture.componentInstance;

    component.formalizar();

    expect(facadeMock.formalizar).toHaveBeenCalled();
    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/conformidade']);
  });

  it('deve voltar para resultado', () => {
    const fixture = TestBed.createComponent(FormalizacaoComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/resultado']);
  });
});
