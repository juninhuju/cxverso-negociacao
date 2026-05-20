import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ContractCardComponent } from '../../../../shared/components/contract-card/contract-card.component';
import { AcompanhamentoDashboardService } from '../../services/acompanhamento-dashboard.service';

@Component({
  selector: 'app-detalhe-contrato',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, ContractCardComponent],
  templateUrl: './detalhe-contrato.component.html',
  styleUrl: './detalhe-contrato.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheContratoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dashboardService = inject(AcompanhamentoDashboardService);

  readonly erroApi = signal<string | null>(null);

  readonly contrato = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const numero = params.get('numero');
        if (!numero) {
          return of(null);
        }

        this.erroApi.set(null);

        return this.dashboardService.buscarContratoPorNumero(numero).pipe(
          catchError((error: unknown) => {
            this.erroApi.set(
              error instanceof Error
                ? error.message
                : 'Falha na comunicacao com a API ao carregar os detalhes do contrato.',
            );
            return of(null);
          }),
        );
      }),
    ),
    { initialValue: null },
  );

  iniciarRenegociacao(): void {
    this.router.navigate(['/renegociacao'], { queryParams: { contrato: this.contrato()?.numero } });
  }

  voltar(): void {
    this.router.navigate(['/acompanhamento']);
  }
}
