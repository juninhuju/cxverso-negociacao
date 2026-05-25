import { Component, Input } from '@angular/core';
import { SimulacaoRenegociacao } from '../../../../models/renegociacao.model';

import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe],
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.scss']
})
export class ResultadoComponent {
  @Input() resultado!: SimulacaoRenegociacao | null;
  @Input() custasObrigatorias!: number;
}
