import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ContractCardComponent } from '../../../../shared/components/contract-card/contract-card.component';
import { Contrato } from '../../../renegociacao/models/renegociacao.model';
import {
    KpiAcompanhamento,
    StatusRenegociacao,
} from '../../models/acompanhamento.model';
import {
    AcompanhamentoDashboardService,
    SolicitacaoAcompanhamento,
} from '../../services/acompanhamento-dashboard.service';

const STATUS_LABEL: Record<StatusRenegociacao, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  AGUARDANDO_JURIDICO: 'Aguard. Jurídico',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    ContractCardComponent,
    MatFormFieldModule
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(AcompanhamentoDashboardService);

  readonly statusLabel = STATUS_LABEL;

  readonly kpis = signal<KpiAcompanhamento>({
    totalRenegociacoes: 0,
    emAndamento: 0,
    concluidas: 0,
    aguardandoJuridico: 0,
    valorTotalRenegociado: 0,
  });

  private readonly _solicitacoes = signal<SolicitacaoAcompanhamento[]>([]);
  readonly solicitacoesUsuario = this._solicitacoes.asReadonly();
  readonly documento = signal<string>(localStorage.getItem('cpfBusca') ?? '');

  private readonly _persistDocumentoEffect = effect(() => {
    localStorage.setItem('cpfBusca', this.documento());
  });

  excluirSolicitacao(protocolo: string): void {
    const confirm = window.confirm('Tem certeza que deseja excluir esta solicitação? Esta ação não poderá ser desfeita.');
    if (!confirm) {
      return;
    }

    this._solicitacoes.update((listaAtual) =>
      listaAtual.filter((solicitacao) => solicitacao.protocolo !== protocolo),
    );
  }

  readonly contratos = signal<Contrato[]>([]);
  readonly contratoSelecionado = signal<Contrato | null>(null);
  readonly buscouContratos = signal(false);

  constructor() {
    void this.carregarSolicitacoes();
  }

  atualizarDocumento(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.documento.set(target?.value ?? '');
  }

  async buscarContratos(): Promise<void> {
    this.buscouContratos.set(true);
    const doc = this.documento().replace(/\D/g, '');
    if (!doc) {
      this.contratos.set([]);
      return;
    }

    const contratos = await firstValueFrom(this.dashboardService.buscarContratosPorDocumento(doc));
    this.contratos.set(contratos);
    this.contratoSelecionado.set(null);
  }

  selecionarContrato(contrato: Contrato): void {
    this.contratoSelecionado.set(contrato);
    this.router.navigate(['/acompanhamento/contrato', contrato.numero]);
  }

  formatDocumento(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return value;
  }

  private async carregarSolicitacoes(): Promise<void> {
    const solicitacoes = await firstValueFrom(this.dashboardService.listarSolicitacoes());
    this._solicitacoes.set(solicitacoes);
  }
}
