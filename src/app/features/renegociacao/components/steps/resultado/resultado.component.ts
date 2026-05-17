import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

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
  readonly cetValor = computed(() =>
    this.saldoAFinanciar() + (this.simulacao()?.totalJuros ?? 0) + this.iofValor()
  );
  readonly totalOperacao = computed(() =>
    (this.simulacao()?.totalPago ?? 0) + this.custasHonorarios() + this.tarifaRenegociacao
  );

  continuar(): void {
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/formalizacao']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/simulacao']);
  }
}
