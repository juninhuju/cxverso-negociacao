import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    ConsultaJuridica,
    Contrato,
    Parcela,
    ResultadoRenegociacao,
    SimulacaoRenegociacao,
    SimulacoesDisponiveis,
    ValidacaoOperacional
} from '../../features/renegociacao/models/renegociacao.model';
import { BffResponse } from '../../shared/models/bff-response.model';

@Injectable({ providedIn: 'root' })
export class RenegociacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffUrl}/renegociacao`;
  private readonly isDev = !environment.production;

  private normalizarTermo(termo: string): string {
    return termo.replace(/\D/g, '').trim();
  }

  buscarContrato(termo: string): Observable<Contrato> {
    if (this.isDev) {
      const termoNormalizado = this.normalizarTermo(termo);

      // Busca no mock local
      return this.http.get<Contrato[]>(`/assets/contratos.json`).pipe(
        map((contratos) => {
          const contrato = contratos.find((c) => {
            const numeroContrato = this.normalizarTermo(c.numero);
            const cpfCnpjContrato = this.normalizarTermo(c.cpfCnpj);
            return numeroContrato === termoNormalizado || cpfCnpjContrato === termoNormalizado;
          });

          if (!contrato) {
            throw new Error('Contrato não encontrado para o termo informado.');
          }

          return contrato;
        }),
      );
    }
    const params = new HttpParams().set('termo', termo);
    return this.http
      .get<BffResponse<Contrato>>(`${this.baseUrl}/contratos`, { params })
      .pipe(map((res) => res.data));
  }

  solicitarConsultaJuridica(numeroContrato: string): Observable<ConsultaJuridica> {
    if (this.isDev) {
      return this.http.get<ConsultaJuridica>(`/assets/consulta-juridica.json`);
    }

    return this.http
      .post<BffResponse<ConsultaJuridica>>(`${this.baseUrl}/consulta-juridica`, { numeroContrato })
      .pipe(map((res) => res.data));
  }

  solicitarValidacaoOperacional(numeroContrato: string): Observable<ValidacaoOperacional> {
    if (this.isDev) {
      interface ValidacaoOperacionalJson extends ValidacaoOperacional {
        numeroContrato: string;
        cliente: string;
      }
      return this.http.get<ValidacaoOperacionalJson[]>(
        `/assets/validacao-operacional.json`
      ).pipe(
        map((validacoes) => {
          const item = validacoes.find((v) => v.numeroContrato === numeroContrato);
          if (!item) {
            throw new Error(`Validação operacional não encontrada para contrato ${numeroContrato}`);
          }
          return {
            status: item.status,
            aptoParaRenegociacao: item.aptoParaRenegociacao,
            impedimentos: item.impedimentos,
            uploadAtendido: item.uploadAtendido,
            checksEtapasAnteriores: item.checksEtapasAnteriores,
            validadoEm: item.validadoEm,
          };
        }),
      );
    }

    return this.http
      .post<BffResponse<ValidacaoOperacional>>(`${this.baseUrl}/validacao-operacional`, {
        numeroContrato,
      })
      .pipe(map((res) => res.data));
  }

  simular(
    numeroContrato: string,
    valorEntrada: number,
    numeroParcelas: number,
  ): Observable<SimulacaoRenegociacao> {
    if (this.isDev) {
      return forkJoin({
        simulacoes: this.http.get<SimulacoesDisponiveis[]>(`/assets/simulacao.json`),
        contratos: this.http.get<Contrato[]>(`/assets/contratos.json`),
      }).pipe(
        map(({ simulacoes, contratos }) => {
          const contrato = contratos.find((item) => item.numero === numeroContrato) ?? null;
          const simulacaoContrato = simulacoes.find((item) => item.numeroContrato === numeroContrato) ?? null;
          return this.calcularSimulacaoPersonalizada(
            valorEntrada,
            numeroParcelas,
            contrato,
            simulacaoContrato,
          );
        }),
      );
    }
    return this.http
      .post<BffResponse<SimulacaoRenegociacao>>(`${this.baseUrl}/simulacao`, {
        numeroContrato,
        valorEntrada,
        numeroParcelas,
      })
      .pipe(map((res) => res.data));
  }

  private calcularSimulacaoPersonalizada(
    valorEntrada: number,
    numeroParcelas: number,
    contrato: Contrato | null,
    simulacaoContrato: SimulacoesDisponiveis | null,
  ): SimulacaoRenegociacao {
    const entrada = Math.max(0, valorEntrada);
    const parcelas = Math.max(1, Math.round(numeroParcelas));
    const saldoOriginal = Math.max(entrada, contrato?.valorDevido ?? entrada);
    const saldoFinanciado = Math.max(0, saldoOriginal - entrada);

    const opcaoExata = simulacaoContrato?.opcoes.find(
      (opcao) => opcao.valorEntrada === entrada && opcao.numeroParcelas === parcelas,
    );

    const taxaReferencia = opcaoExata?.taxaJuros ?? simulacaoContrato?.opcoes[0]?.taxaJuros ?? 1.2;
    const taxaNormalizada = taxaReferencia > 1 ? taxaReferencia / 100 : taxaReferencia;
    const valorParcela = this.calcularParcelaComJuros(saldoFinanciado, parcelas, taxaNormalizada);

    const totalParcelado = valorParcela * parcelas;
    const totalPago = entrada + totalParcelado;
    const totalJuros = Math.max(0, totalParcelado - saldoFinanciado);

    const parcelasArray: Parcela[] = [];
    const dataInicial = new Date(2026, 4, 15);

    for (let i = 1; i <= parcelas; i++) {
      const data = new Date(dataInicial);
      data.setMonth(data.getMonth() + i);
      const vencimento = data.toISOString().split('T')[0];

      parcelasArray.push({
        numero: i,
        valor: valorParcela,
        vencimento,
      });
    }

    return {
      valorEntrada: entrada,
      numeroParcelas: parcelas,
      valorParcela,
      taxaJuros: taxaReferencia,
      totalPago,
      totalJuros,
      parcelas: parcelasArray,
    };
  }

  private calcularParcelaComJuros(saldo: number, parcelas: number, taxaMensal: number): number {
    if (parcelas <= 0) {
      return 0;
    }

    if (saldo <= 0) {
      return 0;
    }

    if (taxaMensal <= 0) {
      return Math.round((saldo / parcelas) * 100) / 100;
    }

    const fator = Math.pow(1 + taxaMensal, parcelas);
    const parcela = (saldo * taxaMensal * fator) / (fator - 1);
    return Math.round(parcela * 100) / 100;
  }

  private calcularSimulacao(valorEntrada: number, numeroParcelas: number): SimulacaoRenegociacao {
    const taxaJuros = 1.0; // Taxa padrão em %
    const valorParcela = Math.round((valorEntrada / numeroParcelas) * 100) / 100;
    const totalPago = valorParcela * numeroParcelas;
    const totalJuros = totalPago - valorEntrada;

    const parcelasArray: Parcela[] = [];
    const dataInicial = new Date(2026, 4, 15); // 15 de maio de 2026

    for (let i = 1; i <= numeroParcelas; i++) {
      const data = new Date(dataInicial);
      data.setMonth(data.getMonth() + i);
      const vencimento = data.toISOString().split('T')[0];

      parcelasArray.push({
        numero: i,
        valor: valorParcela,
        vencimento,
      });
    }

    return {
      valorEntrada,
      numeroParcelas,
      valorParcela,
      taxaJuros,
      totalPago,
      totalJuros,
      parcelas: parcelasArray as readonly Parcela[],
    };
  }

  carregarOpcoesSimulacao(numeroContrato: string): Observable<SimulacoesDisponiveis | null> {
    if (this.isDev) {
      return this.http.get<SimulacoesDisponiveis[]>(`/assets/simulacao.json`).pipe(
        map((opcoes) => {
          const opcaoEncontrada = opcoes.find((o) => o.numeroContrato === numeroContrato);
          return opcaoEncontrada ?? null;
        }),
      );
    }
    const params = new HttpParams().set('numeroContrato', numeroContrato);
    return this.http
      .get<BffResponse<SimulacoesDisponiveis>>(`${this.baseUrl}/simulacao-opcoes`, { params })
      .pipe(map((res) => res.data));
  }

  formalizar(numeroContrato: string): Observable<ResultadoRenegociacao> {
    if (this.isDev) {
      return this.http.get<ResultadoRenegociacao>(`/assets/resultado-renegociacao.json`);
    }
    return this.http
      .post<BffResponse<ResultadoRenegociacao>>(`${this.baseUrl}/formalizar`, { numeroContrato })
      .pipe(map((res) => res.data));
  }
}
