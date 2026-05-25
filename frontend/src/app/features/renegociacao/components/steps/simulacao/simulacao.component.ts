import { CommonModule } from '@angular/common';
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
import { Contrato, OpcaoSimulacao, SimulacaoRenegociacao, SimulacoesDisponiveis } from '../../../models/renegociacao.model';
import { PersonalizadaComponent } from './personalizada/personalizada.component';
import { ResultadoComponent } from './resultado/resultado.component';
import { SugestoesComponent } from './sugestoes/sugestoes.component';

@Component({
  selector: 'app-simulacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    PersonalizadaComponent,
    SugestoesComponent,
    ResultadoComponent,
  ],
  templateUrl: './simulacao.component.html',
  styleUrl: './simulacao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulacaoComponent {
  modalPersonalizadaAberto = false;

  abrirModalPersonalizada() {
    this.modalPersonalizadaAberto = true;
  }

  fecharModalPersonalizada() {
    this.modalPersonalizadaAberto = false;
  }

  aceitarOferta() {
    // Avança para a tela de confirmação com a opção selecionada
    this.continuar();
  }


  concluirPersonalizada() {
    // Avança para a tela de confirmação com os dados personalizados
    this.fecharModalPersonalizada();
    this.continuar();
  }

  // Computed para resultado personalizado (SimulacaoRenegociacao)
  readonly resultadoPersonalizado = computed<SimulacaoRenegociacao | null>(() => {
    return {
      valorEntrada: this.valorEntrada(),
      numeroParcelas: this.numeroParcelas(),
      valorParcela: this.parcelaMensalPreview(),
      taxaJuros: this.taxaJurosDinamica(),
      totalPago: this.cetValor(),
      totalJuros: this.jurosValor(),
      parcelas: [],
    };
  });

  // Computed para resultado da opção sugerida (SimulacaoRenegociacao)
  readonly resultadoSimulacao = computed<SimulacaoRenegociacao | null>(() => {
    const opcao = this.opcaoSelecionada();
    if (!opcao) return null;
    return {
      valorEntrada: opcao.valorEntrada,
      numeroParcelas: opcao.numeroParcelas,
      valorParcela: opcao.valorParcela,
      taxaJuros: this.normalizarTaxa(opcao.taxaJuros),
      totalPago: opcao.valorParcela * opcao.numeroParcelas + this.custasObrigatorias(),
      totalJuros: 0, // ajuste conforme necessário
      parcelas: [],
    };
  });

  // Resultado final exibido

  // resultadoFinal não é mais necessário, pois o modal controla o fluxo
    // Métodos públicos para uso no template
  public entradaMinima(): number {
    const contrato = this.contrato();
    if (!contrato) return 0;
    return Math.round(contrato.valorDevido * 0.08 * 100) / 100;
  }

  public parcelaMinima(): number {
    const contrato = this.contrato();
    return (contrato as any)?.parcelaMinima ?? 1;
  }

  public parcelaMaxima(): number {
    const contrato = this.contrato();
    return (contrato as any)?.parcelaMaxima ?? 120;
  }
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

        return this.api.obterOpcoesSimulacao(contrato.numero).pipe(
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
    // Comparação robusta para evitar problemas de tipo/precisão
    const mesmaEntrada = Number(simulacao.valorEntrada) === Number(this.valorEntrada());
    const mesmasParcelas = Number(simulacao.numeroParcelas) === Number(this.numeroParcelas());
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
            (o: OpcaoSimulacao) => o.valorEntrada === simulacaoAtual.valorEntrada && o.numeroParcelas === simulacaoAtual.numeroParcelas,
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
    // Salva dados da simulação no localStorage após simular
    setTimeout(() => {
      const simulacao = this.simulacao();
      if (simulacao) {
        localStorage.setItem('simulacao_atual', JSON.stringify(simulacao));
      }
    }, 500);
  }

simular(): void {
  const entrada = this.valorEntrada();
  const parcelas = this.numeroParcelas();
  const contrato = this.contrato();

  // Se a opção foi selecionada a partir das sugestões da API, não aplicar validação rígida
  const opcaoSelecionada = this.opcaoSelecionada();
  const isSugestaoApi = opcaoSelecionada && opcaoSelecionada.valorEntrada === entrada && opcaoSelecionada.numeroParcelas === parcelas;

  if (!isSugestaoApi) {
    if (!Number.isFinite(entrada) || entrada < 0 || !Number.isFinite(parcelas) || parcelas < 1) {
      this.erroApiOpcoes.set('Preencha corretamente os campos obrigatórios para simular.');
      return;
    }

    // Validação extra conforme backend
    if (contrato) {
      const saldoDevedor = contrato.valorDevido;
      const entradaMinima = Math.round(saldoDevedor * 0.08 * 100) / 100;
      if (entrada < entradaMinima) {
        this.erroApiOpcoes.set(`O valor de entrada deve ser pelo menos 8% do saldo devedor (mínimo: R$ ${entradaMinima.toLocaleString('pt-BR', {minimumFractionDigits: 2})}).`);
        return;
      }
      // Se o contrato tiver faixa de parcelas
      const parcelaMin = (contrato as any).parcelaMinima ?? 1;
      const parcelaMax = (contrato as any).parcelaMaxima ?? 120;
      if (parcelas < parcelaMin || parcelas > parcelaMax) {
        this.erroApiOpcoes.set(`O número de parcelas deve estar entre ${parcelaMin} e ${parcelaMax}.`);
        return;
      }
    }
  }

  this.erroApiOpcoes.set(null);
  this.facade.simular(entrada, parcelas);
  // Salva dados da simulação no localStorage após simular
  setTimeout(() => {
    const simulacao = this.simulacao();
    if (simulacao) {
      localStorage.setItem('simulacao_atual', JSON.stringify(simulacao));
    }
  }, 500);
}
  continuar(): void {
    // Só chama simular() se não houver simulação compatível
    if (!this.simulacaoCompativel()) {
      this.simular();
    }
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/confirmacao']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/validacao']);
  }
}
