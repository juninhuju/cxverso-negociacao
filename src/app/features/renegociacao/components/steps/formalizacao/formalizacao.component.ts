import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-formalizacao',
  standalone: true,
  imports: [
    CurrencyPipe,
    PercentPipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './formalizacao.component.html',
  styleUrl: './formalizacao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormalizacaoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;
  readonly contrato = this.facade.contrato;
  readonly simulacao = this.facade.simulacao;

  formalizar(): void {
    this.facade.formalizar();
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/conformidade']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/resultado']);
  }
}
