import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { RenegociacaoApiService } from '../../core/auth/renegociacao-api.service';
import { RenegociacaoActions } from './renegociacao.actions';
import { selectContrato } from './renegociacao.selectors';

@Injectable()
export class RenegociacaoEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(RenegociacaoApiService);
  private readonly store = inject(Store);

  buscarContrato$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RenegociacaoActions.buscarContrato),
      switchMap(({ termo }) =>
        this.api.buscarContrato(termo).pipe(
          map((contratos) => RenegociacaoActions.buscarContratoSuccess({ contratos })),
          catchError((err: unknown) =>
            of(
              RenegociacaoActions.buscarContratoFailure({
                error: err instanceof Error ? err.message : 'Erro ao buscar contrato',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  solicitarValidacaoOperacional$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RenegociacaoActions.solicitarValidacaoOperacional),
      switchMap(({ numeroContrato }) =>
        this.api.solicitarValidacaoOperacional(numeroContrato).pipe(
          map((validacao) => RenegociacaoActions.solicitarValidacaoOperacionalSuccess({ validacao })),
          catchError((err: unknown) =>
            of(
              RenegociacaoActions.solicitarValidacaoOperacionalFailure({
                error: err instanceof Error ? err.message : 'Erro na validação operacional',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  solicitarConsultaJuridica$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RenegociacaoActions.solicitarConsultaJuridica),
      switchMap(({ numeroContrato }) =>
        this.api.solicitarConsultaJuridica(numeroContrato).pipe(
          map((consulta) => RenegociacaoActions.solicitarConsultaJuridicaSuccess({ consulta })),
          catchError((err: unknown) =>
            of(
              RenegociacaoActions.solicitarConsultaJuridicaFailure({
                error: err instanceof Error ? err.message : 'Erro na consulta jurídica',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  simularRenegociacao$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RenegociacaoActions.simularRenegociacao),
      withLatestFrom(this.store.select(selectContrato)),
      switchMap(([{ valorEntrada, numeroParcelas }, contrato]) =>
        this.api.simular(contrato?.numero ?? '', valorEntrada, numeroParcelas).pipe(
          map((simulacao) => RenegociacaoActions.simularRenegociacaoSuccess({ simulacao })),
          catchError((err: unknown) =>
            of(
              RenegociacaoActions.simularRenegociacaoFailure({
                error: err instanceof Error ? err.message : 'Erro na simulação',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  formalizarRenegociacao$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RenegociacaoActions.formalizarRenegociacao),
      withLatestFrom(this.store.select(selectContrato)),
      switchMap(([, contrato]) =>
        this.api.formalizar(contrato?.numero ?? '').pipe(
          map((resultado) => RenegociacaoActions.formalizarRenegociacaoSuccess({ resultado })),
          catchError((err: unknown) =>
            of(
              RenegociacaoActions.formalizarRenegociacaoFailure({
                error: err instanceof Error ? err.message : 'Erro na formalização',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
