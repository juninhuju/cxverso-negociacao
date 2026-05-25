
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BffResponse } from '../../shared/models/bff-response.model';
import { ConsultaJuridica, Contrato, ContratoDetalhe, ResultadoRenegociacao, SimulacaoRenegociacao, SimulacoesDisponiveis, ValidacaoOperacional } from '../../shared/models/contrato.model';
import { buildFriendlyApiErrorMessage } from '../http/api-error.util';

export interface ContratoFrontDto {
  numero: string;
  cliente: string;
  cpfCnpj: string;
  produto: string;
  valorDevido: number;
  dataVencimento: string;
  status: string;
  diasAtraso: number;
  garantia: 'SIM' | 'NAO';
}

export interface ConsultaJuridicaResponse {
  status: 'APROVADO' | string;
  aptoParaRenegociacao: boolean;
  impedimentos: string[];
  uploadAtendido: boolean;
  checksEtapasAnteriores: boolean;
  validadoEm: string;
}

export interface SimulacaoOpcoesResponse {
  numeroContrato: string;
  nomeCliente: string;
  opcoes: Array<{
    id: number;
    descricao: string;
    valorEntrada: number;
    numeroParcelas: number;
    taxaJuros: number;
    valorParcela: number;
    economiaTotal: number;
    detalhes: string;
  }>;
}

export interface SimulacaoResponse {
  valorEntrada: number;
  numeroParcelas: number;
  valorParcela: number;
  taxaJuros: number;
  totalPago: number;
  totalJuros: number;
  parcelas: Array<{ numero: number; valor: number; vencimento: string }>;
}

export interface FormalizarResponse {
  aprovado: boolean;
  motivoRecusa: string | null;
  novoContratoNumero: string;
}


@Injectable({ providedIn: 'root' })
export class RenegociacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffUrl}/renegociacao`;
  private readonly negociacaoUrl = `${environment.bffUrl}/negociacao`;

  private toFriendlyError(error: unknown, contexto: string): Observable<never> {
    return throwError(() => new Error(buildFriendlyApiErrorMessage(error, contexto)));
  }

  buscarContratos(termo: string): Observable<Contrato[]> {
    const params = new HttpParams().set('termo', termo);
    return this.http
      .get<BffResponse<Contrato[]>>(`${this.baseUrl}/contratos`, { params })
      .pipe(
        map((res) => res.data),
        catchError((error: unknown) => this.toFriendlyError(error, 'buscar contrato')),
      );
  }

  carregarDetalheContrato(numeroContrato: string): Observable<ContratoDetalhe> {
    return this.http
      .get<ContratoDetalhe>(`${this.negociacaoUrl}/contratos/${numeroContrato}`)
      .pipe(catchError((error: unknown) => this.toFriendlyError(error, 'carregar detalhe do contrato')));
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
    // Compatível com backend-final: POST /negociacao/contratos/:contratoId/simulacao
    const body = {
      entrada: Number(valorEntrada),
      quantidadeParcelas: Number(numeroParcelas)
    };
    return this.http
      .post<any>(`${this.negociacaoUrl}/contratos/${numeroContrato}/simulacao`, body)
      .pipe(
        map((resp) => ({
          valorEntrada: resp.entradaNegociacao,
          numeroParcelas: resp.quantidadeParcelas ?? resp.numeroParcelas ?? 0,
          valorParcela: resp.valorParcela,
          taxaJuros: resp.jurosAoMesTaxa,
          totalPago: resp.valorParcela * (resp.quantidadeParcelas ?? resp.numeroParcelas ?? 0) + (resp.custasCartorarias ?? 0),
          totalJuros: 0, // Não fornecido pelo backend
          parcelas: []   // Não fornecido pelo backend
        })),
        catchError((error: unknown) => this.toFriendlyError(error, 'simular renegociacao')),
      );
  }
  obterOpcoesSimulacao(numeroContrato: string): Observable<SimulacoesDisponiveis | null> {
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
