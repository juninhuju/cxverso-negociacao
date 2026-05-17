import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-conclusao',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './conclusao.component.html',
  styleUrl: './conclusao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConclusaoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);

  readonly resultado = this.facade.resultado;

  concluir(): void {
    this.facade.reiniciarSessao();
    this.router.navigate(['/renegociacao/busca']);
  }

  voltarEtapaAnterior(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/conformidade']);
  }
}
