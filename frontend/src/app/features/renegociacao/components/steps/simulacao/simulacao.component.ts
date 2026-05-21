import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { buildFriendlyApiErrorMessage } from '../../../../../core/http/api-error.util';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato, OpcaoSimulacao, SimulacoesDisponiveis } from '../../../models/renegociacao.model';

@Component({
  selector: 'app-simulacao',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    PercentPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './simulacao.component.html',
  styleUrl: './simulacao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulacaoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  readonly stepAtual = this.facade.stepAtual;
  private readonly router = inject(Router);
  private readonly api = inject(RenegociacaoApiService);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly simulacao = this.facade.simulacao;
  readonly contrato = this.facade.contrato;
  readonly consulta = this.facade.consultaJuridica;

  readonly opcaoSelecionada = signal<OpcaoSimulacao | null>(null);
  readonly valorEntrada = signal(0);
  readonly numeroParcelas = signal(12);
  readonly erroApiOpcoes = signal<string | null>(null);

  readonly opcoesDisponiveis = toSignal(
    toObservable(this.contrato).pipe(
      switchMap((contrato: Contrato | null) => {
        if (!contrato) return of([] as OpcaoSimulacao[]);

        this.erroApiOpcoes.set(null);

        return this.api.carregarOpcoesSimulacao(contrato.numero).pipe(
          map((resp: SimulacoesDisponiveis | null) => (resp?.opcoes ? [...resp.opcoes] : [])),
          catchError((error: unknown) => {
            this.erroApiOpcoes.set(buildFriendlyApiErrorMessage(error, 'carregar opcoes de simulacao'));
            return of([] as OpcaoSimulacao[]);
          }),
        );
      }),
    ),
    { initialValue: [] },
  );

  readonly opcoesVisiveis = computed(() => this.opcoesDisponiveis());

  readonly saldoDevedor = computed(() => this.contrato()?.valorDevido ?? 0);
  readonly descontoAplicado = computed(() => this.opcaoSelecionada()?.economiaTotal ?? 0);
  readonly custasObrigatorias = computed(() => this.consulta()?.custasObrigatorias ?? 5090);

  readonly saldoRenegociado = computed(() =>
    Math.max(0, this.saldoDevedor() - this.descontoAplicado()) + this.custasObrigatorias(),
  );

  readonly saldoAFinanciar = computed(() => Math.max(0, this.saldoRenegociado() - this.valorEntrada()));
  readonly boletoUnico = computed(() => this.valorEntrada());

  readonly taxaJurosDinamica = computed(() =>
    this.normalizarTaxa(this.simulacaoCompativel()?.taxaJuros ?? this.opcaoSelecionada()?.taxaJuros ?? 0.018),
  );

  readonly simulacaoCompativel = computed(() => {
    const simulacao = this.simulacao();
    if (!simulacao) {
      return null;
    }

    const mesmaEntrada = simulacao.valorEntrada === this.valorEntrada();
    const mesmasParcelas = simulacao.numeroParcelas === this.numeroParcelas();
    return mesmaEntrada && mesmasParcelas ? simulacao : null;
  });

  readonly parcelaMensalPreview = computed(() => {
    const s = this.simulacaoCompativel();
    if (s) return s.valorParcela;
    return this.saldoAFinanciar() / Math.max(1, this.numeroParcelas());
  });

  readonly jurosValor = computed(() => {
    const s = this.simulacaoCompativel();
    if (s) return s.totalJuros;
    return this.saldoAFinanciar() * this.taxaJurosDinamica();
  });

  readonly iofPercentual = 0.0038;
  readonly iofValor = computed(() => this.saldoAFinanciar() * this.iofPercentual);

  readonly cetTaxa = computed(() => this.taxaJurosDinamica() + this.iofPercentual);
  readonly cetValor = computed(() => this.saldoAFinanciar() + this.jurosValor() + this.iofValor());

  readonly colunasTabela = ['numero', 'vencimento', 'valor'] as const;

  private readonly prefillEffect = effect(
    () => {
      const contratoAtual = this.contrato();
      const opcoes = this.opcoesDisponiveis();
      const simulacaoAtual = this.simulacao();

      if (!contratoAtual) return;

      if (simulacaoAtual) {
        this.valorEntrada.set(simulacaoAtual.valorEntrada);
        this.numeroParcelas.set(simulacaoAtual.numeroParcelas);

        if (!this.opcaoSelecionada()) {
          const correspondente = opcoes.find(
            (o) => o.valorEntrada === simulacaoAtual.valorEntrada && o.numeroParcelas === simulacaoAtual.numeroParcelas,
          );
          if (correspondente) this.opcaoSelecionada.set(correspondente);
        }
        return;
      }

      if (opcoes.length > 0 && !this.opcaoSelecionada()) {
        const primeira = opcoes[0];
        this.opcaoSelecionada.set(primeira);
        this.valorEntrada.set(primeira.valorEntrada);
        this.numeroParcelas.set(primeira.numeroParcelas);
      }
    },
  );

  private normalizarTaxa(taxa: number): number {
    return taxa > 1 ? taxa / 100 : taxa;
  }

  taxaJurosPercentual(opcao: OpcaoSimulacao): number {
    return this.normalizarTaxa(opcao.taxaJuros);
  }

  atualizarValorEntrada(valor: number | string | null): void {
    const numero = this.converterParaNumero(valor, 0);
    this.valorEntrada.set(Math.max(0, numero));
  }

  atualizarNumeroParcelas(valor: number | string | null): void {
    const numero = this.converterParaNumero(valor, 1);
    this.numeroParcelas.set(Math.max(1, Math.round(numero)));
  }

  private converterParaNumero(valor: number | string | null, fallback: number): number {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return valor;
    }

    if (typeof valor === 'string') {
      const normalizado = valor.replace(',', '.').trim();
      if (!normalizado) {
        return fallback;
      }
      const convertido = Number(normalizado);
      return Number.isFinite(convertido) ? convertido : fallback;
    }

    return fallback;
  }

  selecionarOpcao(opcao: OpcaoSimulacao): void {
    this.opcaoSelecionada.set(opcao);
    this.valorEntrada.set(opcao.valorEntrada);
    this.numeroParcelas.set(opcao.numeroParcelas);

    this.simular();
  }

  simular(): void {
    const entrada = Math.max(0, this.valorEntrada());
    const parcelas = Math.max(1, this.numeroParcelas());
    if (!entrada || !parcelas) {
      this.erroApiOpcoes.set('Preencha corretamente os campos obrigatórios para simular.');
      return;
    }
    this.facade.simular(entrada, parcelas);
  }

  continuar(): void {
    this.simular();
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/resultado']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/validacao']);
  }
}
