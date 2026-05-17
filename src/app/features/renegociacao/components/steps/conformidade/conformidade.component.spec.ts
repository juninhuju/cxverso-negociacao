import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConformidadeComponent } from './conformidade.component';

describe('ConformidadeComponent', () => {
  const facadeMock = {
    loading: () => false,
    contrato: () => null,
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
      imports: [ConformidadeComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('deve concluir e navegar para conclusao', () => {
    const fixture = TestBed.createComponent(ConformidadeComponent);
    const component = fixture.componentInstance;

    component.concluirConformidade();

    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/conclusao']);
  });

  it('deve voltar para formalização', () => {
    const fixture = TestBed.createComponent(ConformidadeComponent);
    const component = fixture.componentInstance;

    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/formalizacao']);
  });
});
