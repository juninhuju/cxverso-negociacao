import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Contrato } from '../../models/contrato.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [MatCardModule, MatDividerModule, CurrencyPipe, DatePipe, StatusBadgeComponent],
  templateUrl: './contract-card.component.html',
  styleUrl: './contract-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractCardComponent {
  readonly contrato = input.required<Contrato>();
}
