import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato } from '../../../models/renegociacao.model';

interface ConsultaEmailDialogData {
  readonly assunto: string;
  readonly corpoEmail: string;
}

@Component({
  selector: 'app-consulta-juridica-modal',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">Consulta Jurídica</h2>

    <mat-dialog-content class="dialog-content">
      @if (aviso) {
        <p class="aviso" role="status">{{ aviso }}</p>
      }

      <mat-form-field appearance="outline" class="email-field">
        <textarea matInput [readonly]="!modoEdicao" rows="18" [(ngModel)]="emailTexto"></textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button class="btn-secondary" type="button" (click)="alternarEdicao()">
        {{ modoEdicao ? 'Salvar texto' : 'Editar texto' }}
      </button>
      <button mat-stroked-button class="btn-secondary" type="button" (click)="copiarTexto()">Copiar</button>
      <button mat-stroked-button class="btn-secondary" type="button" (click)="fechar()">Voltar</button>
      <button mat-flat-button class="btn-primary" type="button" (click)="enviarConsulta()">
        Enviar consulta
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-title {
        color: var(--color-primary-blue);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
      }

      .dialog-content {
        background: var(--color-step-bg);
      }

      .email-field {
        width: 100%;
      }

      .email-field textarea {
        color: var(--color-gray-900);
        font-size: var(--font-size-sm);
        line-height: 1.5;
      }

      .aviso {
        margin: 0 0 12px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--color-success-green);
        background: var(--color-success-green-light);
        color: var(--color-success-green);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
      }

      .dialog-actions {
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
      }

      .btn-secondary,
      .btn-primary {
        transition: transform 0.15s ease, box-shadow 0.2s ease;
      }

      .btn-secondary:hover,
      .btn-primary:hover {
        transform: translateY(-1px);
      }

      .btn-secondary:focus-visible,
      .btn-primary:focus-visible {
        outline: 2px solid var(--color-primary-blue);
        outline-offset: 2px;
      }

      .btn-secondary {
        --mdc-outlined-button-outline-color: var(--color-gray-400);
        --mdc-outlined-button-label-text-color: var(--color-gray-800);
        --mat-outlined-button-state-layer-color: var(--color-primary-blue);
      }

      .btn-primary {
        --mdc-filled-button-container-color: var(--color-primary-blue);
        --mdc-filled-button-label-text-color: var(--color-surface);
        --mat-filled-button-state-layer-color: var(--color-primary-blue-dark);
        box-shadow: var(--shadow-sm);
      }
    `,
  ],
})
export class ConsultaJuridicaModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ConsultaJuridicaModalComponent>);
  readonly data = inject<ConsultaEmailDialogData>(MAT_DIALOG_DATA);
  emailTexto = this.data.corpoEmail;
  modoEdicao = false;
  aviso: string | null = null;

  fechar(): void {
    this.dialogRef.close('voltar');
  }

  alternarEdicao(): void {
    this.modoEdicao = !this.modoEdicao;
    this.aviso = this.modoEdicao ? 'Edição habilitada.' : 'Texto atualizado.';
  }

  async copiarTexto(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.emailTexto);
      this.aviso = 'Texto copiado para a área de transferência.';
    } catch {
      this.aviso = 'Não foi possível copiar o texto neste navegador.';
    }
  }

  enviarConsulta(): void {
    this.aviso = 'Consulta enviada com sucesso.';

    setTimeout(() => {
      this.dialogRef.close('continuar');
    }, 1000);
  }
}

@Component({
  selector: 'app-consulta-juridica',
  standalone: true,
  imports: [],
  templateUrl: './consulta-juridica.component.html',
  styleUrl: './consulta-juridica.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultaJuridicaComponent implements OnInit {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;
  readonly consulta = this.facade.consultaJuridica;

  async ngOnInit(): Promise<void> {
    const contratoAtual = this.contrato();
    if (!contratoAtual) {
      this.router.navigate(['/renegociacao/validacao']);
      return;
    }

    this.facade.solicitarConsultaJuridica(contratoAtual.numero);

    const dialogRef = this.dialog.open(ConsultaJuridicaModalComponent, {
      width: '920px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: false,
      data: {
        assunto: 'SOLICITAÇÃO DE VALIDAÇÃO JURÍDICA - RENEGOCIAÇÃO DE CONTRATO',
        corpoEmail: this.gerarCorpoEmail(contratoAtual),
      },
    });

    const resultado = await firstValueFrom(dialogRef.afterClosed());

    if (resultado === 'continuar') {
      this.facade.avancarStep();
      this.router.navigate(['/renegociacao/simulacao']);
      return;
    }

    this.router.navigate(['/renegociacao/validacao']);
  }

  private gerarCorpoEmail(contrato: Contrato): string {
    const numeroContrato = contrato.numero || '987654321';
    const cliente = contrato.cliente || 'Empresa XYZ Ltda';
    const cpfCnpj = contrato.cpfCnpj || '12.345.678/0001-90';
    const produto = contrato.produto || 'Crédito Comercial';
    const status = this.formatarStatus(contrato.status);
    const custasObrigatorias = this.consulta()?.custasObrigatorias ?? 5090;
    const dataGeracao = this.formatarDataHora(new Date());

    return `SOLICITAÇÃO DE VALIDAÇÃO JURÍDICA - RENEGOCIAÇÃO DE CONTRATO\n\n` +
      `Contrato: ${numeroContrato}\n` +
      `Cliente: ${cliente}\n` +
      `CPF/CNPJ: ${cpfCnpj}\n` +
      `Produto: ${produto}\n` +
      `Status Geral: ${status}\n\n` +
      `Prezada equipe jurídica,\n\n` +
      `Solicito validação e autorização para prosseguir com a renegociação do contrato supracitado, atualmente em execução extrajudicial.\n\n` +
      `Resumo da Situação:\n` +
      `O cliente procurou a unidade para regularizar a dívida através de renegociação administrativa.\n` +
      `Não foram identificados impedimentos jurídicos através da integração com o Portal DIJUR.\n\n` +
      `Custas e Honorários:\n` +
      `- Total de custas obrigatórias: ${this.formatarMoeda(custasObrigatorias)}\n` +
      `- Custas incorporadas automaticamente à entrada da renegociação\n\n` +
      `Solicitação:\n` +
      `Peço validação jurídica quanto à viabilidade operacional da renegociação e orientações necessárias para prosseguimento do processo.\n\n` +
      `Aguardo retorno para continuidade.\n\n` +
      `Atenciosamente,\n` +
      `Ana Silva (C987654)\n\n` +
      `Gerado automaticamente pelo sistema Negocia.CAIXA em ${dataGeracao}`;
  }

  private formatarStatus(status: string): string {
    const mapaStatus: Record<string, string> = {
      APTO: 'Apto',
      EXECUCAO_EXTRAJUDICIAL: 'Em Execução Extrajudicial',
      INADIMPLENTE: 'Inadimplente',
      EM_ACORDO: 'Em Acordo',
      REGULARIZADO: 'Regularizado',
      CEDIDO: 'Cedido',
    };

    return mapaStatus[status] ?? status;
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  }

  private formatarDataHora(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(data);
  }
}
