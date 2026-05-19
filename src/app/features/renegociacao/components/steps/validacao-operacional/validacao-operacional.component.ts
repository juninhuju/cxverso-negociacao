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


  // Mock de contrato atual (substitua por this.contrato() real)
  contratoAtual = {
    numero: '100000001',
    cliente: 'Ana Paula Souza',
    produto: 'Crédito Pessoal',
    valorDevido: 15000.00,
    status: 'EXECUCAO_EXTRAJUDICIAL',
    diasAtraso: 124,
    garantia: 'Imóvel',
  };

  // Custas e entrada dinâmicas
  get entradaMinima(): number {
    return Math.round((this.contratoAtual.valorDevido * 0.10) * 100) / 100;
  }

  get custasTotal(): number {
    return this.contratoAtual.status === 'EXECUCAO_EXTRAJUDICIAL'
      ? Math.round((this.contratoAtual.valorDevido * 0.125) * 100) / 100
      : 0;
  }

  entrada = 0;

  // Validações automáticas (mock)
  readonly validacoes = [
    {
      label: 'Sem impedimentos jurídicos identificados',
      valido: true
    },
    {
      label: 'Sem impedimentos relativos à execução extrajudicial',
      valido: true
    },
    {
      label: 'Critérios de risco e crédito validados',
      valido: true
    },
    {
      label: 'Custas extrajudiciais identificadas',
      valido: this.contratoAtual.status === 'EXECUCAO_EXTRAJUDICIAL'
    },
    {
      label: 'Laudo',
      valido: true // ou false para testar cor vermelha
    }
  ];

  // Garantia mock
  readonly garantia = {
    tipo: this.contratoAtual.garantia,
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
