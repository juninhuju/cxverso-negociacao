import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato } from '../../../models/renegociacao.model';

@Component({
  selector: 'app-selecionar-contrato',
  standalone: true,
  imports: [
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
  private readonly http = inject(HttpClient);

  private readonly statusLabel: Record<string, string> = {
    APTO: 'Apto',
    EXECUCAO_EXTRAJUDICIAL: 'Execução Extrajudicial',
    INADIMPLENTE: 'Inadimplente',
    EM_ACORDO: 'Em Acordo',
    REGULARIZADO: 'Regularizado',
    CEDIDO: 'Cedido',
  };

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;
  readonly todosContratos = toSignal(
    this.http.get<Contrato[]>('/assets/contratos.json').pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly contratosCliente = computed(() => {
    const contratoAtual = this.contrato();
    if (!contratoAtual) {
      return [] as Contrato[];
    }

    return this.todosContratos().filter((item: Contrato) => item.cpfCnpj === contratoAtual.cpfCnpj);
  });

  readonly totalContratos = computed(() => this.contratosCliente().length);
  readonly totalSaldoDevedor = computed(() =>
    this.contratosCliente().reduce((acc: number, item: Contrato) => acc + item.valorDevido, 0)
  );

  confirmar(): void {
    const contrato = this.contrato();
    if (!contrato) return;

    // Validar elegibilidade: regra status !== 'CEDIDO'
    if (!this.facade.validarContratoElegibilidade(contrato.status)) {
      return; // Template já exibe o aviso
    }

    this.facade.solicitarValidacaoOperacional(contrato.numero);
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/validacao']);
  }

  selecionarContrato(contratoSelecionado: Contrato): void {
    if (!this.facade.validarContratoElegibilidade(contratoSelecionado.status)) {
      return;
    }

    this.facade.buscarContrato(contratoSelecionado.numero);
    this.facade.solicitarValidacaoOperacional(contratoSelecionado.numero);
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/validacao']);
  }

  formatarStatus(status: string): string {
    return this.statusLabel[status] ?? status;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  obterClasseDiasAtraso(diasAtraso: number | undefined): string {
    if (!diasAtraso || diasAtraso <= 0) {
      return 'atraso-badge--normal';
    }

    if (diasAtraso > 91) {
      return 'atraso-badge--critico';
    }

    return 'atraso-badge--atencao';
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/busca']);
  }
}
