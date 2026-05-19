import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { RenegociacaoEffects } from './states/renegociacao/renegociacao.effects';
import { renegociacaoReducer } from './states/renegociacao/renegociacao.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideEnvironmentNgxMask(),
    provideStore({ renegociacao: renegociacaoReducer }),
    provideEffects([RenegociacaoEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
