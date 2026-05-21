import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

const HISTORICO_KEY = 'negocia_caixa_historico';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [
    CurrencyPipe,
    PercentPipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);

  readonly stepAtual = this.facade.stepAtual;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;
  readonly consulta = this.facade.consultaJuridica;
  readonly simulacao = this.facade.simulacao;

  // Valores de apoio para o detalhamento quando não vierem da API
  readonly tarifaRenegociacao = 250;
  readonly carenciaDias = 30;
  readonly iofTaxa = 0.0038;

  readonly saldoRenegociado = computed(() => this.contrato()?.valorDevido ?? 0);
  readonly custasHonorarios = computed(() => this.consulta()?.custasObrigatorias ?? 5090);
  readonly saldoAFinanciar = computed(() =>
    Math.max(0, this.saldoRenegociado() - (this.simulacao()?.valorEntrada ?? 0))
  );
  readonly iofValor = computed(() => this.saldoAFinanciar() * this.iofTaxa);
  readonly cetTaxa = computed(() => (this.simulacao()?.taxaJuros ?? 0) + this.iofTaxa);
  readonly jurosValorPositivo = computed(() => Math.abs(this.simulacao()?.totalJuros ?? 0));
  readonly cetValor = computed(() =>
    this.saldoAFinanciar() + (this.simulacao()?.totalJuros ?? 0) + this.iofValor()
  );
  readonly totalOperacao = computed(() =>
    (this.simulacao()?.totalPago ?? 0) + this.custasHonorarios() + this.tarifaRenegociacao
  );

  continuar(): void {
    this.salvarNegociacaoLocalStorage();
    this.facade.formalizar();
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/conclusao']);
  }

  private salvarNegociacaoLocalStorage(): void {
    const contrato = this.contrato();
    const simulacao = this.simulacao();
    if (!contrato || !simulacao) return;

    const agora = new Date().toISOString().slice(0, 19);
    const valorTotal = simulacao.totalPago;
    const protocolo = `NEG-${contrato.numero}-${Date.now()}`;
    const entrada = {
      id: protocolo,
      protocolo,
      numeroContrato: contrato.numero,
      cliente: contrato.cliente,
      cpfCnpj: contrato.cpfCnpj,
      produto: contrato.produto,
      valorTotal,
      valorTotalFormatado: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valorTotal),
      dataInicio: agora,
      dataUltimo: agora,
      status: 'CONCLUIDA' as const,
      contratoCaixa: contrato.numero,
    };

    try {
      const historico: typeof entrada[] = JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? '[]');
      const jaExiste = historico.some((h) => h.numeroContrato === contrato.numero && h.status === 'CONCLUIDA');
      if (!jaExiste) {
        historico.push(entrada);
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
      }
    } catch {
      // localStorage indisponível, ignorar
    }
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/simulacao']);
  }
}
