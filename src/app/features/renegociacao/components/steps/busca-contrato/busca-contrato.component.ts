import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-busca-contrato',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgxMaskDirective,
  ],
  templateUrl: './busca-contrato.component.html',
  styleUrl: './busca-contrato.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscaContratoComponent {
  private readonly facade = inject(RenegociacaoFacade);
  private readonly router = inject(Router);

  constructor() {
    // Resetar sessão quando volta/entra na tela de busca
    this.facade.reiniciarSessao();
  }

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly termoBusca = signal(localStorage.getItem('renegociacao_cpf_busca') ?? '');
  readonly erroSync = signal<string | null>(null);
  private readonly buscaPendente = signal(false);
  private readonly termoBuscaPendente = signal('');
  readonly mascaraDocumento = computed(() => {
    const somenteDigitos = this.termoBusca().replace(/\D/g, '');

    if (somenteDigitos.length <= 9) {
      return '';
    }

    if (somenteDigitos.length <= 11) {
      return '000.000.000-00';
    }

    return '00.000.000/0000-00';
  });

  private readonly buscarContratoEffect = effect(() => {
    if (!this.buscaPendente()) {
      return;
    }

    const termo = this.termoBuscaPendente();
    const error = this.error();
    const contrato = this.facade.contrato();

    if (error) {
      this.buscaPendente.set(false);
      this.exibirErroTemporario('Contrato não encontrado');
      return;
    }

    if (!contrato) {
      return;
    }

    if (!this.contratoCorrespondeAoTermo(termo, contrato.numero, contrato.cpfCnpj)) {
      return;
    }

    this.buscaPendente.set(false);
    this.facade.avancarStep();
    this.router.navigate(['/renegociacao/selecionar']);
  });

  onTermoBuscaChange(value: string): void {
    this.termoBusca.set(value);
    localStorage.setItem('renegociacao_cpf_busca', value);
  }

  buscar(): void {
    const termo = this.termoBusca().trim();
    if (!termo) {
      return;
    }

    this.erroSync.set(null);
    this.termoBuscaPendente.set(termo);
    this.buscaPendente.set(true);
    this.facade.buscarContrato(termo);
  }

  private exibirErroTemporario(mensagem: string): void {
    this.erroSync.set(mensagem);
    setTimeout(() => this.erroSync.set(null), 3000);
  }

  private contratoCorrespondeAoTermo(
    termo: string,
    numeroContrato: string,
    cpfCnpj: string,
  ): boolean {
    const termoNormalizado = termo.replace(/\D/g, '');
    return (
      numeroContrato === termo ||
      cpfCnpj === termo ||
      cpfCnpj.replace(/\D/g, '') === termoNormalizado
    );
  }
}
