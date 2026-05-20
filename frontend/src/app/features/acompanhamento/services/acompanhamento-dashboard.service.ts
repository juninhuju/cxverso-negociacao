import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { buildFriendlyApiErrorMessage } from '../../../core/http/api-error.util';
import { Contrato } from '../../renegociacao/models/renegociacao.model';
import { RenegociacaoResumo } from '../models/acompanhamento.model';

export type SolicitacaoAcompanhamento = RenegociacaoResumo & {
  readonly cpfCnpj: string;
  readonly produto: string;
  readonly protocolo: string;
  readonly valorTotalFormatado: string;
  readonly contratoCaixa: string; // Adicionada anteriormente
  readonly dataUltimo: string; // Adicionada para corrigir o erro
};

@Injectable({ providedIn: 'root' })
export class AcompanhamentoDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffUrl}/negociacao`;

  private toFriendlyError(error: unknown, contexto: string): Observable<never> {
    return throwError(() => new Error(buildFriendlyApiErrorMessage(error, contexto)));
  }

  listarSolicitacoes(): Observable<SolicitacaoAcompanhamento[]> {
    return this.http
      .get<SolicitacaoAcompanhamento[]>(`${this.baseUrl}/negociacoes`)
      .pipe(catchError((error: unknown) => this.toFriendlyError(error, 'consultar solicitacoes')));
  }

  buscarContratosPorDocumento(documento: string): Observable<Contrato[]> {
    const documentoNormalizado = this.normalizar(documento);
    return this.http
      .get<{ id: number; nome: string; cpf: string }>(`${this.baseUrl}/clientes/${documentoNormalizado}`)
      .pipe(
        switchMap((cliente) =>
          this.http
            .get<Array<{ id: number; tipoContrato: string; saldoDevedor: number; statusDivida: string }>>(
              `${this.baseUrl}/clientes/${cliente.id}/contratos`,
            )
            .pipe(
              map((contratos) =>
                contratos.map((contrato) => ({
                  numero: String(contrato.id),
                  cliente: cliente.nome,
                  cpfCnpj: cliente.cpf,
                  produto: contrato.tipoContrato,
                  valorDevido: contrato.saldoDevedor,
                  dataVencimento: '',
                  status: this.mapearStatus(contrato.statusDivida),
                })),
              ),
            ),
        ),
        catchError((error: unknown) => this.toFriendlyError(error, 'buscar contratos por documento')),
      );
  }

  buscarContratoPorNumero(numeroContrato: string): Observable<Contrato | null> {
    return this.http
      .get<{ id: number; clienteId: number; tipoContrato: string; saldoDevedor: number; statusDivida: string }>(
        `${this.baseUrl}/contratos/${numeroContrato}`,
      )
      .pipe(
        map((contrato) => ({
          numero: String(contrato.id),
          cliente: `Cliente ${contrato.clienteId}`,
          cpfCnpj: '',
          produto: contrato.tipoContrato,
          valorDevido: contrato.saldoDevedor,
          dataVencimento: '',
          status: this.mapearStatus(contrato.statusDivida),
        })),
        catchError((error: unknown) => this.toFriendlyError(error, 'buscar contrato por numero')),
      );
  }

  private mapearStatus(statusDivida: string): Contrato['status'] {
    const statusNormalizado = statusDivida?.toUpperCase();

    switch (statusNormalizado) {
      case 'EM_ATRASO':
      case 'EM_ATRASO_JUDICIAL':
        return 'INADIMPLENTE';
      case 'REGULAR':
        return 'REGULARIZADO';
      case 'CEDIDO':
        return 'CEDIDO';
      default:
        return 'APTO';
    }
  }

  private normalizar(valor: string): string {
    return valor.replace(/\D/g, '');
  }
}
