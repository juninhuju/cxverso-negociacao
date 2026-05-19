import { DOCUMENT } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private readonly defaultTitle = 'Negocia.CAIXA';
  private readonly defaultDescription =
    'Portal de renegociação de contratos comerciais com simulação, validação e acompanhamento.';

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    { initialValue: null },
  );

  private readonly syncSeoEffect = effect(() => {
    this.navigationEnd();

    const activeRoute = this.getDeepestRoute(this.router.routerState.snapshot.root);
    const routeTitle = activeRoute.data['title'] as string | undefined;
    const routeDescription = activeRoute.data['description'] as string | undefined;

    const pageTitle = routeTitle
      ? `${routeTitle} | ${this.defaultTitle}`
      : this.defaultTitle;
    const description = routeDescription ?? this.defaultDescription;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.updateCanonical(this.router.url);
  });

  private getDeepestRoute(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = snapshot;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }

  private updateCanonical(url: string): void {
    const sanitizedUrl = url.split('?')[0].split('#')[0];
    const canonicalUrl = `${this.document.location.origin}${sanitizedUrl}`;
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', canonicalUrl);
  }
}
