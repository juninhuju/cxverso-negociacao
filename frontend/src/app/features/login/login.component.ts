import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/auth/user.service';
import { RenegociacaoFacade } from '../../states/renegociacao/renegociacao.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly renegociacaoFacade = inject(RenegociacaoFacade);

  readonly username = signal('');
  readonly password = signal('');
  readonly hidePassword = signal(true);
  readonly termoBusca = signal('');
  readonly erroSync = signal<string | null>(null);
  private readonly buscaPendente = signal(false);
  private readonly termoBuscaPendente = signal('');

  private readonly buscarContratoEffect = effect(() => {
    if (!this.buscaPendente()) {
      return;
    }

    const termo = this.termoBuscaPendente();
    const error = this.renegociacaoFacade.error();
    const contrato = this.renegociacaoFacade.contrato();

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
    this.auth.login(contrato.cliente, '');
    this.userService.carregarUsuario();
    this.router.navigate(['/renegociacao'], {
      state: { contratoSelecionado: contrato },
    });
  });

  entrar(): void {
    const user = this.username().trim();
    if (!user) return;
    this.auth.login(user, this.password());
    this.userService.carregarUsuario();
    this.router.navigate(['/renegociacao']);
  }

  toggleHidePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  buscarContrato(): void {
    const termo = this.termoBusca().trim();
    if (!termo) {
      return;
    }

    this.erroSync.set(null);
    this.termoBuscaPendente.set(termo);
    this.buscaPendente.set(true);
    this.renegociacaoFacade.buscarContrato(termo);
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
