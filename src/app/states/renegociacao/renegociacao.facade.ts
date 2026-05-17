import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { RenegociacaoActions } from './renegociacao.actions';
import {
    selectConsultaJuridica,
    selectContrato,
    selectError,
    selectLoading,
    selectResultado,
    selectSession,
    selectSimulacao,
    selectStepAtual,
    selectValidacaoOperacional,
} from './renegociacao.selectors';

@Injectable({ providedIn: 'root' })
export class RenegociacaoFacade {
  private readonly store = inject(Store);

  readonly session = toSignal(this.store.select(selectSession));
  readonly loading = toSignal(this.store.select(selectLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectError), { initialValue: null });
  readonly contrato = toSignal(this.store.select(selectContrato), { initialValue: null });
  readonly validacaoOperacional = toSignal(this.store.select(selectValidacaoOperacional), {
    initialValue: null,
  });
  readonly consultaJuridica = toSignal(this.store.select(selectConsultaJuridica), {
    initialValue: null,
  });
  readonly simulacao = toSignal(this.store.select(selectSimulacao), { initialValue: null });
  readonly resultado = toSignal(this.store.select(selectResultado), { initialValue: null });
  readonly stepAtual = toSignal(this.store.select(selectStepAtual), { initialValue: 0 });

  buscarContrato(termo: string): void {
    this.store.dispatch(RenegociacaoActions.buscarContrato({ termo }));
  }

  solicitarValidacaoOperacional(numeroContrato: string): void {
    this.store.dispatch(RenegociacaoActions.solicitarValidacaoOperacional({ numeroContrato }));
  }

  solicitarConsultaJuridica(numeroContrato: string): void {
    this.store.dispatch(RenegociacaoActions.solicitarConsultaJuridica({ numeroContrato }));
  }

  simular(valorEntrada: number, numeroParcelas: number): void {
    this.store.dispatch(RenegociacaoActions.simularRenegociacao({ valorEntrada, numeroParcelas }));
  }

  formalizar(): void {
    this.store.dispatch(RenegociacaoActions.formalizarRenegociacao());
  }

  avancarStep(): void {
    this.store.dispatch(RenegociacaoActions.avancarStep());
  }

  voltarStep(): void {
    this.store.dispatch(RenegociacaoActions.voltarStep());
  }

  reiniciarSessao(): void {
    this.store.dispatch(RenegociacaoActions.reiniciarSessao());
  }

  validarContratoElegibilidade(status: string): boolean {
    return status !== 'CEDIDO';
  }
}
