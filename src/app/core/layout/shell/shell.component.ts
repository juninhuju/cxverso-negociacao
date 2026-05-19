import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
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
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  readonly pageBodyRef = viewChild<ElementRef<HTMLElement>>('pageBodyRef');

  private readonly navigationTick = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => Date.now()),
    ),
    { initialValue: Date.now() },
  );

  readonly username = signal('CAIXA');
  readonly isSidenavOpen = signal(false);
  readonly matricula = signal('123456');
  readonly dataAtual = computed(() => this.formatarDataAtual());

  private readonly scrollToTopOnNavigation = effect(() => {
    this.navigationTick();
    this.resetScrollPosition();
  });

  toggleSidenav(): void {
    this.isSidenavOpen.update((value) => !value);
  }

  closeSidenav(): void {
    this.isSidenavOpen.set(false);
  }

  onRouteActivate(): void {
    this.resetScrollPosition();
    setTimeout(() => this.resetScrollPosition(), 0);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private resetScrollPosition(): void {
    const scrollToTop = (): void => {
      const pageBody = this.pageBodyRef()?.nativeElement;
      if (pageBody) {
        pageBody.scrollTop = 0;
      }

      const shellContainers = this.document.querySelectorAll<HTMLElement>(
        '.page-body, .mat-drawer-content, .mat-sidenav-content, .shell-content, main',
      );
      shellContainers.forEach((container) => {
        container.scrollTop = 0;
      });

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      this.document.documentElement.scrollTop = 0;
      this.document.body.scrollTop = 0;
    };

    scrollToTop();
    queueMicrotask(scrollToTop);
    requestAnimationFrame(() => {
      scrollToTop();
      requestAnimationFrame(scrollToTop);
    });
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
