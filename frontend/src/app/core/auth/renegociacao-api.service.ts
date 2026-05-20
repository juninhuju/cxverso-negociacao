import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    ConsultaJuridica,
    Contrato,
    ResultadoRenegociacao,
    SimulacaoRenegociacao,
    SimulacoesDisponiveis,
    ValidacaoOperacional
} from '../../features/renegociacao/models/renegociacao.model';
import { BffResponse } from '../../shared/models/bff-response.model';
import { buildFriendlyApiErrorMessage } from '../http/api-error.util';

@Injectable({ providedIn: 'root' })
export class RenegociacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffUrl}/renegociacao`;

  private toFriendlyError(error: unknown, contexto: string): Observable<never> {
    return throwError(() => new Error(buildFriendlyApiErrorMessage(error, contexto)));
  }

  buscarContrato(termo: string): Observable<Contrato> {
    const params = new HttpParams().set('termo', termo);
    return this.http
      .get<BffResponse<Contrato>>(`${this.baseUrl}/contratos`, { params })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'buscar contrato')),
      );
  }

  solicitarConsultaJuridica(numeroContrato: string): Observable<ConsultaJuridica> {
    return this.http
      .post<BffResponse<ConsultaJuridica>>(`${this.baseUrl}/consulta-juridica`, { numeroContrato })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'solicitar consulta juridica')),
      );
  }

  solicitarValidacaoOperacional(numeroContrato: string): Observable<ValidacaoOperacional> {
    return this.http
      .post<BffResponse<ValidacaoOperacional>>(`${this.baseUrl}/validacao-operacional`, {
        numeroContrato,
      })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'validar operacao de renegociacao')),
      );
  }

  simular(
    numeroContrato: string,
    valorEntrada: number,
    numeroParcelas: number,
  ): Observable<SimulacaoRenegociacao> {
    return this.http
      .post<BffResponse<SimulacaoRenegociacao>>(`${this.baseUrl}/simulacao`, {
        numeroContrato,
        valorEntrada,
        numeroParcelas,
      })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'simular renegociacao')),
      );
  }

  carregarOpcoesSimulacao(numeroContrato: string): Observable<SimulacoesDisponiveis | null> {
    const params = new HttpParams().set('numeroContrato', numeroContrato);
    return this.http
      .get<BffResponse<SimulacoesDisponiveis>>(`${this.baseUrl}/simulacao-opcoes`, { params })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'carregar opcoes de simulacao')),
      );
  }

  formalizar(numeroContrato: string): Observable<ResultadoRenegociacao> {
    return this.http
      .post<BffResponse<ResultadoRenegociacao>>(`${this.baseUrl}/formalizar`, { numeroContrato })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'formalizar renegociacao')),
      );
  }
}
