import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-validacao-operacional',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatIconModule,
    NgClass,
  ],
  templateUrl: './validacao-operacional.component.html',
  styleUrl: './validacao-operacional.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidacaoOperacionalComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);


  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;
  readonly validacao = this.facade.validacaoOperacional;

  // Mocks para template (substitua por dados reais do backend/facade se disponível)
  readonly custas = {
    total: 1500.00,
    entrada: 0
  };
  readonly garantia = {
    tipo: 'Imóvel',
    valor: 200000.00,
    registro: 'Matrícula 12345',
    endereco: 'Rua Exemplo, 123, Centro, Cidade/UF',
    valida: true
  };


  abrirConsultaJuridica(): void {
    this.router.navigate(['/renegociacao/juridico']);
  }

  prosseguirSimulacao(): void {
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/simulacao']);
  }

  continuar(): void {
    const contrato = this.contrato();
    if (!contrato) return;
    this.facade.solicitarConsultaJuridica(contrato.numero);
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/juridico']);
  }

  voltar(): void {
    this.facade.voltarStep();
    this.router.navigate(['/renegociacao/selecionar']);
  }
}
