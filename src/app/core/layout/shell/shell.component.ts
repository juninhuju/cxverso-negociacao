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

  readonly username = this.authService.username;
  readonly isSidenavOpen = signal(false);
  readonly matricula = signal('Matrícula 00981234');
  readonly dataAtual = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date())
  );

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
}
