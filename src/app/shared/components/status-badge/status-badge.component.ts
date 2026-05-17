import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { StatusContrato } from '../../models/contrato.model';

const STATUS_CONFIG: Record<StatusContrato, { label: string; cssClass: string }> = {
  APTO: { label: 'Apto', cssClass: 'status-apto' },
  EXECUCAO_EXTRAJUDICIAL: { label: 'Exec. Extrajudicial', cssClass: 'status-extrajudicial' },
  INADIMPLENTE: { label: 'Inadimplente', cssClass: 'status-inadimplente' },
  EM_ACORDO: { label: 'Em Acordo', cssClass: 'status-acordo' },
  REGULARIZADO: { label: 'Regularizado', cssClass: 'status-regularizado' },
  CEDIDO: { label: 'Cedido', cssClass: 'status-cedido' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <mat-chip [class]="config.cssClass" aria-label="Status: {{ config.label }}">
      {{ config.label }}
    </mat-chip>
  `,
  styles: [`
    mat-chip {
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-apto       { background: #e8f5e9; color: #2e7d32; }
    .status-extrajudicial { background: #fff3e0; color: #e65100; }
    .status-inadimplente  { background: #ffebee; color: #c62828; }
    .status-acordo        { background: #e3f2fd; color: #1565c0; }
    .status-regularizado  { background: #f3e5f5; color: #6a1b9a; }
    .status-cedido        { background: #f5f5f5; color: #333333; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusContrato>();

  get config() {
    return STATUS_CONFIG[this.status()];
  }
}
