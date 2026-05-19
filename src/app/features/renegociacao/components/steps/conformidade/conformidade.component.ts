import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-conformidade',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './conformidade.component.html',
  styleUrl: './conformidade.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConformidadeComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;
  readonly contrato = this.facade.contrato;
  readonly simulacao = this.facade.simulacao;

  concluirConformidade(): void {
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/conclusao']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/resultado']);
  }
}
