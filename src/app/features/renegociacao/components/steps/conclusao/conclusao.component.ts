import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
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

  readonly stepAtual = this.facade.stepAtual;
  readonly loading = this.facade.loading;


  /** Exibe barra de sucesso customizada */
  sucessoBarraVisivel = false;

  gerarContratoEBoleto(): void {
    this.sucessoBarraVisivel = true;
    setTimeout(() => (this.sucessoBarraVisivel = false), 6000);
    // Executa as ações de navegação e reset depois de exibir a barra
    setTimeout(() => {
      this.router.navigate(['/renegociacao/busca']);
      this.facade.reiniciarSessao();
    }, 3000);
  }

  fecharBarraSucesso(): void {
    this.sucessoBarraVisivel = false;
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
