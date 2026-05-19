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

  readonly loading = this.facade.loading;

  /**
   * Ação principal do card “Documentos da Renegociação”.
   * Aqui você pode:
   *  - chamar um método do facade (ex.: this.facade.gerarDocumentos())
   *  - ou navegar para uma rota/tela responsável pela geração/download.
   */
  gerarContratoEBoleto(): void {
    // Sugestão segura (sem assumir API existente): navegar para a etapa de documentos.
    // Ajuste a rota para a real do seu fluxo.
    this.router.navigate(['/renegociacao/documentos']);
  }

  /** Botão “Nova Busca” */
  novaBusca(): void {
    // Ajuste para a rota real da sua “busca”/início de atendimento.
    this.router.navigate(['/renegociacao/busca']);
  }

  /** Botão “Ver Painel” */
  verPainel(): void {
    // Ajuste para o painel do seu produto/sistema.
    this.router.navigate(['/acompanhamento']);
  }
}
