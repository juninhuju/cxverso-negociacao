import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato } from '../../../models/renegociacao.model';

@Component({
  selector: 'app-selecionar-contrato',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './selecionar-contrato.component.html',
  styleUrl: './selecionar-contrato.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelecionarContratoComponent {

  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);

  readonly stepAtual = this.facade.stepAtual;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;

  readonly contratosCliente = computed(() => {
    const contratoAtual = this.contrato();
    if (!contratoAtual) {
      return [];
    }

    return [contratoAtual];
  });

  readonly totalContratos = computed(() => this.contratosCliente().length);

  readonly totalSaldoDevedor = computed(() =>
    this.contratosCliente()
      .reduce((acc, c) => acc + c.valorDevido, 0)
  );

  readonly contratoMaisCritico = computed(() =>
    this.contratosCliente()[0] ?? null
  );

  selecionarContrato(contratoSelecionado: Contrato): void {
    if (!this.validarElegibilidade(contratoSelecionado)) return;

    this.facade.definirContrato(contratoSelecionado);
    this.facade.solicitarValidacaoOperacional(contratoSelecionado.numero);
    this.facade.avancarStep();

    this.router.navigate(['/renegociacao/validacao']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/busca']);
  }

  confirmar(): void {
    const contratoAtual = this.contrato();
    if (!contratoAtual) {
      return;
    }

    if (!this.validarElegibilidade(contratoAtual)) {
      return;
    }

    this.facade.solicitarValidacaoOperacional(contratoAtual.numero);
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/validacao']);
  }

  private validarElegibilidade(contrato: Contrato): boolean {
    return this.facade.validarContratoElegibilidade(contrato.status);
  }

  isContratoElegivel(contrato: Contrato): boolean {
    return this.validarElegibilidade(contrato);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarStatus(status: string): string {
    return this.statusLabelMap[status] ?? status;
  }

  private readonly statusLabelMap: Record<string, string> = {
    APTO: 'Apto',
    EXECUCAO_EXTRAJUDICIAL: 'Execução Extrajudicial',
    EXECUCAO_JUDICIAL: 'Execução Judicial',
    INADIMPLENTE: 'Inadimplente',
    EM_ACORDO: 'Em Acordo',
    REGULARIZADO: 'Regularizado',
    CEDIDO: 'Cedido',
  };

  getStatusClasse(status: string): string {
    const mapa: Record<string, string> = {
      EXECUCAO_EXTRAJUDICIAL: 'execucao_extrajudicial',
      EXECUCAO_JUDICIAL: 'execucao_judicial',
      INADIMPLENTE: 'inadimplente',
      REGULARIZADO: 'regularizado',
      CEDIDO: 'cedido',
    };

    return mapa[status] ?? '';
  }

  obterClasseDiasAtraso(diasAtraso?: number): string {
    if (!diasAtraso || diasAtraso <= 0) {
      return 'atraso-badge--normal';
    }

    if (diasAtraso > 90) {
      return 'atraso-badge--critico';
    }

    return 'atraso-badge--atencao';
  }

  isContratoCritico(item: Contrato): boolean {
    return this.contratoMaisCritico()?.numero === item.numero;
  }

}
