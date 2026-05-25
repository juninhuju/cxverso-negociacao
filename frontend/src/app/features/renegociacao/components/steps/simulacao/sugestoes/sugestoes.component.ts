
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OpcaoSimulacao } from '../../../../models/renegociacao.model';

@Component({
  selector: 'app-sugestoes',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe],
  templateUrl: './sugestoes.component.html',
  styleUrls: ['./sugestoes.component.scss']
})
export class SugestoesComponent {
  @Input() opcoes: OpcaoSimulacao[] = [];
  @Input() opcaoSelecionada: OpcaoSimulacao | null = null;
  @Output() selecionar = new EventEmitter<OpcaoSimulacao>();

  @Input() aceitarOferta: () => void = () => {};

  onSelecionar(opcao: OpcaoSimulacao) {
    this.selecionar.emit(opcao);
  }
}
