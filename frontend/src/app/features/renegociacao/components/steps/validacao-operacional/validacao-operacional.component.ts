import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    inject,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { RenegociacaoApiService } from '../../../../../core/auth/renegociacao-api.service';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ContratoDetalhe } from '../../../models/renegociacao.model';
import { ConsultaJuridicaComponent } from '../consulta-juridica/consulta-juridica.component';

@Component({
  selector: 'app-validacao-operacional',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatIconModule,
    NgClass,
  ],
  templateUrl: './validacao-operacional.component.html',
  styleUrl: './validacao-operacional.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidacaoOperacionalComponent {

  // ================= DEPENDÊNCIAS =================
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(RenegociacaoApiService);
  private readonly destroyRef = inject(DestroyRef);

  // ================= STATE =================
  readonly contrato = this.facade.contrato;
  readonly validacao = this.facade.validacaoOperacional;

  readonly detalheContrato = signal<ContratoDetalhe | null>(null);

  // ================= EFFECT =================
  private ultimoContratoId: string | null = null;

  private readonly carregarDetalheEffect = effect(() => {
    const contrato = this.contrato();

    const contratoId = contrato?.numero ? String(contrato.numero) : null;
    if (!contratoId) return;

    if (this.ultimoContratoId === contratoId) return;
    this.ultimoContratoId = contratoId;

    this.api.carregarDetalheContrato(contratoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: detalhe => this.detalheContrato.set(detalhe),
        error: () => this.detalheContrato.set(null),
      });
  });

  // ================= COMPUTED =================

  readonly entradaMinima = computed(() => {
    const contrato = this.contrato();

    if (!contrato) return 0;

    return this.round2(contrato.valorDevido * 0.10);
  });

  readonly custasTotal = computed(() => {
    const detalhe = this.detalheContrato();

    if (!detalhe) return 0;

    return this.round2(
      (detalhe.custasCartorarias ?? 0) +
      (detalhe.custas ?? 0) +
      (detalhe.honorarios ?? 0)
    );
  });

  readonly validacoes = computed(() => {
    const contrato = this.contrato();
    const custas = this.custasTotal();

    return [
      { label: 'Sem impedimentos jurídicos identificados', valido: true },
      { label: 'Sem impedimentos relativos à execução extrajudicial', valido: true },
      { label: 'Critérios de risco e crédito validados', valido: true },
      {
        label: 'Custas extrajudiciais identificadas',
        valido: contrato?.status === 'EXECUCAO_EXTRAJUDICIAL' || custas > 0,
      },
      { label: 'Laudo', valido: true },
    ];
  });

  readonly garantiasContrato = computed(() => {
    const detalhe = this.detalheContrato();

    if (!Array.isArray(detalhe?.garantias)) {
      return [];
    }

    return detalhe.garantias
      .filter(g => g && g.tipo)
      .map(g => ({
        tipo: this.formatarTipoGarantia(g.tipo),
        valor: g.valorGarantia ?? null,
        registro: g.registroGarantia ?? null,
        descricao: g.descricao ?? null,
        endereco: (g as any).endereco ?? g.descricao ?? null,
      }));
  });

  // ================= ACTIONS =================

  async abrirConsultaJuridica(): Promise<void> {
    const contrato = this.contrato();
    if (!contrato) return;

    this.facade.solicitarConsultaJuridica(contrato.numero);

    const dialogRef = this.dialog.open(ConsultaJuridicaComponent, {
      width: '980px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        contrato,
        nomeAnalista: 'Ana Silva',
        matriculaAnalista: 'C987654',
      },
    });

    const resultado = await firstValueFrom(dialogRef.afterClosed());

    if (resultado === 'continuar') {
      this.facade.avancarStep();
      this.router.navigate(['/renegociacao/simulacao']);
    }
  }

  prosseguirSimulacao(): void {
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/simulacao']);
  }

  continuar(): void {
    void this.abrirConsultaJuridica();
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/selecionar']);
  }

  // ================= UTILS =================

  private round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private formatarTipoGarantia(tipo: string): string {
    const mapa: Record<string, string> = {
      IMOVEL: 'Imóvel',
      VEICULO: 'Veículo',
    };

    return mapa[tipo] ?? tipo;
  }
}
