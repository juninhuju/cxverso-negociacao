import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
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
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(RenegociacaoApiService);


  readonly stepAtual = this.facade.stepAtual;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;
  readonly validacao = this.facade.validacaoOperacional;
  readonly detalheContrato = signal<ContratoDetalhe | null>(null);

  private ultimoContratoDetalhado: string | null = null;

  private readonly carregarDetalheContratoEffect = effect(() => {
    const contrato = this.contrato();
    if (!contrato || this.ultimoContratoDetalhado === contrato.numero) {
      return;
    }

    this.ultimoContratoDetalhado = contrato.numero;
    this.api.carregarDetalheContrato(contrato.numero).subscribe({
      next: (detalhe) => this.detalheContrato.set(detalhe),
      error: () => this.detalheContrato.set(null),
    });
  });

  get entradaMinima(): number {
    const contrato = this.contrato();
    if (!contrato) {
      return 0;
    }
    return Math.round((contrato.valorDevido * 0.10) * 100) / 100;
  }

  get custasTotal(): number {
    const detalhe = this.detalheContrato();
    if (!detalhe) {
      return 0;
    }

    return Math.round((detalhe.custasCartorarias + detalhe.custas + detalhe.honorarios) * 100) / 100;
  }

  entrada = 0;

  readonly validacoes = computed(() => {
    const contrato = this.contrato();
    const detalhe = this.detalheContrato();

    return [
      {
        label: 'Sem impedimentos jurídicos identificados',
        valido: true,
      },
      {
        label: 'Sem impedimentos relativos à execução extrajudicial',
        valido: true,
      },
      {
        label: 'Critérios de risco e crédito validados',
        valido: true,
      },
      {
        label: 'Custas extrajudiciais identificadas',
        valido: contrato?.status === 'EXECUCAO_EXTRAJUDICIAL' || (detalhe ? this.custasTotal > 0 : false),
      },
      {
        label: 'Laudo',
        valido: true,
      },
    ];
  });

  readonly garantia = computed(() => {
    const contrato = this.contrato();
    const detalhe = this.detalheContrato();
    const primeiraGarantia = detalhe?.garantias?.[0];

    return {
      tipo: primeiraGarantia ? this.formatarTipoGarantia(primeiraGarantia.tipo) : (contrato?.garantia ?? 'Não informado'),
      valor: primeiraGarantia?.valorGarantia ?? null,
      registro: primeiraGarantia?.registroGarantia ?? 'Não informado',
      endereco: primeiraGarantia?.descricao ?? 'Não informado',
      valida: Boolean(primeiraGarantia),
    };
  });


  async abrirConsultaJuridica(): Promise<void> {
    const contrato = this.contrato();
    if (!contrato) {
      return;
    }

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

  private formatarTipoGarantia(tipo: string): string {
    const mapa: Record<string, string> = {
      IMOVEL: 'Imóvel',
      VEICULO: 'Veículo',
    };

    return mapa[tipo] ?? tipo;
  }
}
