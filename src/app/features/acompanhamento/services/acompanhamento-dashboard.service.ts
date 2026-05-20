import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  listarSolicitacoes(): Observable<SolicitacaoAcompanhamento[]> {
    return this.http
      .get<SolicitacaoAcompanhamento[]>('/assets/solicitacoes-acompanhamento.json')
      .pipe(catchError(() => of([])));
  }

  buscarContratosPorDocumento(documento: string): Observable<Contrato[]> {
    const documentoNormalizado = this.normalizar(documento);
    return this.http.get<Contrato[]>('/assets/contratos.json').pipe(
      map((contratos) =>
        contratos.filter(
          (contrato) => this.normalizar(contrato.cpfCnpj) === documentoNormalizado,
        ),
      ),
      catchError(() => of([])),
    );
  }

  private normalizar(valor: string): string {
    return valor.replace(/\D/g, '');
  }
}
