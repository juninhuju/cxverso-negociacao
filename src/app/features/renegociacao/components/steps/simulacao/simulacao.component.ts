import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato, OpcaoSimulacao, SimulacoesDisponiveis } from '../../../models/renegociacao.model';

@Component({
  selector: 'app-simulacao',
  standalone: true,
  imports: [
    CurrencyPipe,
    PercentPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './simulacao.component.html',
  styleUrl: './simulacao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulacaoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);
  private readonly api = inject(RenegociacaoApiService);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly simulacao = this.facade.simulacao;
  readonly contrato = this.facade.contrato;
  readonly consulta = this.facade.consultaJuridica;

  readonly opcoesDisponiveis = toSignal(
    toObservable(this.contrato).pipe(
      switchMap((contrato: Contrato | null) => {
        if (!contrato) {
          return of([] as OpcaoSimulacao[]);
        }

        return this.api.carregarOpcoesSimulacao(contrato.numero).pipe(
          map((simulacoes: SimulacoesDisponiveis | null) => simulacoes?.opcoes ? [...simulacoes.opcoes] : []),
          catchError(() => of([] as OpcaoSimulacao[])),
        );
      }),
    ),
    { initialValue: [] },
  );
  readonly opcaoSelecionada = signal<OpcaoSimulacao | null>(null);

  readonly valorEntrada = signal(0);
  readonly numeroParcelas = signal(12);

  readonly opcoesVisiveis = computed(() => this.opcoesDisponiveis().slice(0, 2));

  readonly saldoDevedor = computed(() => this.contrato()?.valorDevido ?? 0);
  readonly descontoAplicado = computed(() => this.opcaoSelecionada()?.economiaTotal ?? 0);
  readonly custasObrigatorias = computed(() => this.consulta()?.custasObrigatorias ?? 5090);
  readonly saldoRenegociado = computed(() =>
    Math.max(0, this.saldoDevedor() - this.descontoAplicado()) + this.custasObrigatorias()
  );

  readonly parcelaMensalPreview = computed(() => {
    const simulacaoAtual = this.simulacao();
    if (simulacaoAtual) {
      return simulacaoAtual.valorParcela;
    }

    const parcelas = Math.max(1, this.numeroParcelas());
    return this.saldoAFinanciar() / parcelas;
  });

  readonly taxaJurosDinamica = computed(() => this.simulacao()?.taxaJuros ?? this.opcaoSelecionada()?.taxaJuros ?? 0.018);

  readonly saldoAFinanciar = computed(() => Math.max(0, this.saldoRenegociado() - this.valorEntrada()));
  readonly boletoUnico = computed(() => this.valorEntrada());

  readonly jurosValor = computed(() => {
    const simulacaoAtual = this.simulacao();
    if (simulacaoAtual) {
      return simulacaoAtual.totalJuros;
    }

    return this.saldoAFinanciar() * this.taxaJurosDinamica();
  });

  readonly iofPercentual = 0.0038;
  readonly iofValor = computed(() => this.saldoAFinanciar() * this.iofPercentual);

  readonly cetTaxa = computed(() => this.taxaJurosDinamica() + this.iofPercentual);
  readonly cetValor = computed(() => this.saldoAFinanciar() + this.jurosValor() + this.iofValor());

  readonly colunasTabela = ['numero', 'vencimento', 'valor'] as const;

  selecionarOpcao(opcao: OpcaoSimulacao): void {
    this.opcaoSelecionada.set(opcao);
    this.valorEntrada.set(opcao.valorEntrada);
    this.numeroParcelas.set(opcao.numeroParcelas);
    this.simular();
  }

  simular(): void {
    this.facade.simular(this.valorEntrada(), this.numeroParcelas());
  }

  continuar(): void {
    // Simula com os parâmetros atuais antes de avançar
    this.simular();
    // Agenda navegação para após a simulação ser enviada
    setTimeout(() => {
      this.facade.avancarStep();
      this.router.navigate(['/renegociacao/resultado']);
    }, 500);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/validacao']);
  }
}
