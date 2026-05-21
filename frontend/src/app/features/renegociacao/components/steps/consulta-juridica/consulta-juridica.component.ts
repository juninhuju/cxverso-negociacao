import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato } from '../../../models/renegociacao.model';

interface ConsultaJuridicaDialogData {
  contrato: Contrato;
  nomeAnalista?: string;
  matriculaAnalista?: string;
}

@Component({
  selector: 'app-consulta-juridica',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './consulta-juridica.component.html',
  styleUrl: './consulta-juridica.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultaJuridicaComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly dialogRef = inject(MatDialogRef<ConsultaJuridicaComponent, 'continuar'>, {
    optional: true,
  });
  private readonly data = inject<ConsultaJuridicaDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly contrato = this.facade.contrato;
  readonly consulta = this.facade.consultaJuridica;

  emailTexto = '';
  modoEdicao = false;
  aviso: string | null = null;

  private readonly sincronizarConsulta = effect(() => {
    const contratoAtual = this.data?.contrato ?? this.contrato();
    const consultaAtual = this.consulta();

    if (!contratoAtual) {
      return;
    }

    if (!consultaAtual) {
      this.facade.solicitarConsultaJuridica(contratoAtual.numero);
    }

    this.emailTexto = this.montarTextoEmail(
      contratoAtual,
      consultaAtual?.custasObrigatorias ?? 0,
      this.data?.nomeAnalista ?? 'Ana Silva',
      this.data?.matriculaAnalista ?? 'C987654',
    );
  });

  alternarEdicao(): void {
    this.modoEdicao = !this.modoEdicao;
    this.aviso = this.modoEdicao
      ? 'Modo de edição habilitado.'
      : 'Texto atualizado com sucesso.';
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
  if (!this.emailTexto.trim()) {
    this.aviso = 'O texto da consulta jurídica é obrigatório.';
    return;
  }
  this.aviso = 'Consulta enviada com sucesso.';
  setTimeout(() => {
    this.fechar();
  }, 1500);
}

fechar(): void {
  this.dialogRef?.close();
}

  private montarTextoEmail(
    contratoAtual: Contrato,
    custasObrigatorias: number,
    nomeAnalista: string,
    matriculaAnalista: string,
  ): string {
    const statusGeral = this.formatarStatus(contratoAtual.status);
    const dataGeracao = this.formatarDataHora(new Date());

    return [
      'SOLICITACAO DE VALIDACAO JURIDICA - RENEGOCIACAO DE CONTRATO',
      '',
      `Contrato: ${contratoAtual.numero}`,
      `Cliente: ${contratoAtual.cliente}`,
      `CPF/CNPJ: ${contratoAtual.cpfCnpj}`,
      `Produto: ${contratoAtual.produto}`,
      `Status Geral: ${statusGeral}`,
      '',
      'Prezada equipe juridica,',
      '',
      'Solicito validacao e autorizacao para prosseguir com a renegociacao do contrato supracitado, atualmente em execucao judicial.',
      '',
      'Resumo da Situacao:',
      'O cliente procurou a unidade para regularizar a divida atraves de renegociacao administrativa. Foi identificado impedimento juridico atraves da integracao com o Portal DIJUR.',
      '',
      'Custas e Honorarios:',
      `- Total de custas obrigatorias: ${this.formatarMoeda(custasObrigatorias)}`,
      '- Custas incorporadas automaticamente a entrada da renegociacao',
      '',
      'Impedimento Juridico Identificado:',
      '- Sistema identificou registro de acao judicial relacionada ao contrato',
      '- Necessaria avaliacao juridica previa para continuidade da renegociacao',
      '',
      'Solicitacao:',
      'Peco validacao juridica quanto a viabilidade operacional da renegociacao e orientacoes necessarias para prosseguimento do processo.',
      '',
      'Aguardo retorno para continuidade.',
      '',
      'Atenciosamente,',
      `${nomeAnalista} (${matriculaAnalista})`,
      `Gerado automaticamente pelo sistema Negocia.CAIXA em ${dataGeracao}`,
    ].join('\n');
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(valor);
  }

  private formatarDataHora(data: Date): string {
    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(data);
    const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(data);

    return `${dataFormatada}, ${horaFormatada}`;
  }

  private formatarStatus(status: Contrato['status']): string {
    switch (status) {
      case 'EXECUCAO_EXTRAJUDICIAL':
        return 'Em Execucao Judicial';
      case 'INADIMPLENTE':
        return 'Inadimplente';
      case 'EM_ACORDO':
        return 'Em Acordo';
      case 'REGULARIZADO':
        return 'Regularizado';
      case 'CEDIDO':
        return 'Cedido';
      case 'APTO':
      default:
        return 'Apto';
    }
  }
}
