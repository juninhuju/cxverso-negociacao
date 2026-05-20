import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';
import { RenegociacaoApiService } from '../../core/auth/renegociacao-api.service';
import { RenegociacaoActions } from './renegociacao.actions';
import { RenegociacaoEffects } from './renegociacao.effects';

describe('RenegociacaoEffects', () => {
  let actions$: Observable<Action>;
  let effects: RenegociacaoEffects;
  let apiService: jasmine.SpyObj<RenegociacaoApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('RenegociacaoApiService', [
      'buscarContrato',
      'solicitarValidacaoOperacional',
    ]);

    TestBed.configureTestingModule({
      providers: [
        RenegociacaoEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: RenegociacaoApiService, useValue: apiServiceSpy },
      ],
    });

    effects = TestBed.inject(RenegociacaoEffects);
    apiService = TestBed.inject(
      RenegociacaoApiService
    ) as jasmine.SpyObj<RenegociacaoApiService>;
  });

  it('should dispatch BuscarContratoSuccess on success', () => {
    const contratoMock = {
      numero: '123',
      cliente: 'Teste',
      cpfCnpj: '12345678901',
      produto: 'Crédito Imobiliário',
      valorDevido: 150000,
      dataVencimento: '2026-06-10',
      status: 'APTO' as const,
    };
    const action = RenegociacaoActions.buscarContrato({ termo: '123' });
    const outcome = RenegociacaoActions.buscarContratoSuccess({ contrato: contratoMock });

    actions$ = hot('-a', { a: action });
    const response = cold('-b|', { b: contratoMock });
    apiService.buscarContrato.and.returnValue(response);

    const expected = cold('--c', { c: outcome });
    expect(effects.buscarContrato$).toBeObservable(expected);
  });

  it('should dispatch BuscarContratoFailure on error', () => {
    const action = RenegociacaoActions.buscarContrato({ termo: '123' });
    const error = 'Erro ao buscar contrato';
    const outcome = RenegociacaoActions.buscarContratoFailure({ error });

    actions$ = hot('-a', { a: action });
    const response = cold('-#|', {}, error);
    apiService.buscarContrato.and.returnValue(response);

    const expected = cold('--c', { c: outcome });
    expect(effects.buscarContrato$).toBeObservable(expected);
  });
});
