import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personalizada',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './personalizada.component.html',
  styleUrls: ['./personalizada.component.scss']
})
export class PersonalizadaComponent {
  @Input() valorEntrada!: number;
  @Input() numeroParcelas!: number;
  @Input() entradaMinima!: number;
  @Input() parcelaMinima!: number;
  @Input() parcelaMaxima!: number;
  @Output() valorEntradaChange = new EventEmitter<number>();
  @Output() numeroParcelasChange = new EventEmitter<number>();
  @Output() simular = new EventEmitter<void>();

  onValorEntradaChange(valor: number) {
    this.valorEntradaChange.emit(valor);
  }

  onNumeroParcelasChange(valor: number) {
    this.numeroParcelasChange.emit(valor);
  }

  onSimular() {
    this.simular.emit();
  }
}
