import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { RenegociacaoFacade } from './renegociacao.facade';

describe('RenegociacaoFacade', () => {
  const dispatch = jasmine.createSpy('dispatch');

  const storeMock = {
    dispatch,
    select: jasmine.createSpy('select').and.returnValue(of(null)),
  };

  beforeEach(() => {
    dispatch.calls.reset();
    storeMock.select.calls.reset();
    storeMock.select.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        RenegociacaoFacade,
        { provide: Store, useValue: storeMock },
      ],
    });
  });

  it('deve despachar buscarContrato', () => {
    const facade = TestBed.inject(RenegociacaoFacade);

    facade.buscarContrato('123');

    expect(dispatch).toHaveBeenCalled();
    const action = dispatch.calls.mostRecent().args[0] as { type: string; termo: string };
    expect(action.type).toContain('Buscar Contrato');
    expect(action.termo).toBe('123');
  });

  it('deve despachar simulação e formalização', () => {
    const facade = TestBed.inject(RenegociacaoFacade);

    facade.simular(1000, 12);
    facade.formalizar();

    const actionTypes = dispatch.calls.allArgs().map(([action]) => (action as { type: string }).type);
    expect(actionTypes.some((type) => type.includes('Simular Renegociacao'))).toBeTrue();
    expect(actionTypes.some((type) => type.includes('Formalizar Renegociacao'))).toBeTrue();
  });

  it('deve despachar ações de navegação', () => {
    const facade = TestBed.inject(RenegociacaoFacade);

    facade.avancarStep();
    facade.voltarStep();
    facade.reiniciarSessao();

    const actionTypes = dispatch.calls.allArgs().map(([action]) => (action as { type: string }).type);
    expect(actionTypes.some((type) => type.includes('Avancar Step'))).toBeTrue();
    expect(actionTypes.some((type) => type.includes('Voltar Step'))).toBeTrue();
    expect(actionTypes.some((type) => type.includes('Reiniciar Sessao'))).toBeTrue();
  });

  it('deve validar elegibilidade de contrato', () => {
    const facade = TestBed.inject(RenegociacaoFacade);

    expect(facade.validarContratoElegibilidade('APTO')).toBeTrue();
    expect(facade.validarContratoElegibilidade('CEDIDO')).toBeFalse();
  });
});
