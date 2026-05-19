import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-conclusao',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './conclusao.component.html',
  styleUrls: ['./conclusao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConclusaoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly stepAtual = this.facade.stepAtual;
  readonly loading = this.facade.loading;


  gerarContratoEBoleto(): void {
    this.router.navigate(['/renegociacao/busca']);
    this.facade.reiniciarSessao();


    // Emitir aviso de sucesso
    this.snackBar.open('Contrato e Boleto gerados com sucesso!', 'Fechar', {
      duration: 6000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  /** Botão “Nova Busca” */
  novaBusca(): void {
    // Reset do progresso da sidebar
    this.facade.reiniciarSessao();
    // Ajuste para a rota real da sua "busca"/início de atendimento.
    this.router.navigate(['/renegociacao/busca']);
  }

  /** Botão “Ver Painel” */
  verPainel(): void {
    // Ajuste para o painel do seu produto/sistema.
    this.router.navigate(['/acompanhamento']);
  }

  concluir(): void {
    this.novaBusca();
  }
}
