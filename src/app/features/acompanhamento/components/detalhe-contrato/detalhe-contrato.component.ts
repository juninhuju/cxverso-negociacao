import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ContractCardComponent } from '../../../../shared/components/contract-card/contract-card.component';
import { Contrato } from '../../../renegociacao/models/renegociacao.model';

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
  private readonly http = inject(HttpClient);

  readonly contrato = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const numero = params.get('numero');
        if (!numero) return of(null);
        return this.http.get<Contrato[]>(`/assets/contratos.json`).pipe(
          map(contratos => contratos.find(c => c.numero === numero) ?? null),
          catchError(() => of(null))
        );
      })
    ),
    { initialValue: null }
  );

  iniciarRenegociacao(): void {
    this.router.navigate(['/renegociacao'], { queryParams: { contrato: this.contrato()?.numero } });
  }

  voltar(): void {
    this.router.navigate(['/acompanhamento']);
  }
}
