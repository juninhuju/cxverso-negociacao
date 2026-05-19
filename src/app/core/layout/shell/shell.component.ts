import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = signal('CAIXA');
  readonly isSidenavOpen = signal(false);
  readonly matricula = signal('123456');
  readonly dataAtual = computed(() => this.formatarDataAtual());

  toggleSidenav(): void {
    this.isSidenavOpen.update((value) => !value);
  }

  closeSidenav(): void {
    this.isSidenavOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatarDataAtual(): string {
    const dataBase = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date());

    const [diaSemana, restante] = dataBase.split(', ');
    if (!diaSemana || !restante) {
      return dataBase;
    }

    const diaSemanaFormatado = this.capitalizeFirst(diaSemana);
    const restanteFormatado = restante.replace(/ de ([a-zà-ú])/i, (_, letra: string) => ` de ${letra.toUpperCase()}`);

    return `${diaSemanaFormatado}, ${restanteFormatado}`;
  }

  private capitalizeFirst(texto: string): string {
    if (!texto) {
      return texto;
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
