# Guard de Autenticação

## Objetivo

Proteger rotas privadas e impedir acesso sem autenticação.

---

## Autenticação Institucional CAIXA — Keycloak / SISET

Em projetos institucionais da CAIXA, a autenticação é realizada via **SISET (Keycloak)**. O usuário obtém um **token JWT** que deve ser incluído em todas as requisições HTTP.

### Biblioteca obrigatória: `keycloak-angular`

A biblioteca `keycloak-angular` abstrai o adaptador Keycloak para JavaScript e fornece:

- **Interceptor automático** — adiciona o header `Authorization: Bearer <token>` em todas as requisições HTTP
- **KeycloakAuthGuard** — base para implementação do guard de rotas
- **KeycloakService** — wrapper que facilita o consumo do Keycloak no Angular

```bash
npm install keycloak-angular keycloak-js
```

### Configuração no `environment.ts`

As credenciais do servidor SSO devem ficar obrigatoriamente em `environment.ts`:

```ts
export const environment = {
  production: false,
  ssoConfig: {
    url: 'http://server:port/auth',
    realm: 'realm',
    clientId: 'client-id',
  },
  bffUrl: 'https://api.exemplo.caixa.gov.br/bff',
};
```

### Inicialização no `app.config.ts`

```ts
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: environment.ssoConfig,
      initOptions: { onLoad: 'check-sso', silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html` },
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
};
```

### Guard com `KeycloakAuthGuard`

```ts
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard {
  constructor() {
    super(inject(Router), inject(KeycloakService));
  }

  async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    if (!this.authenticated) {
      await this.keycloakAngular.login({ redirectUri: window.location.origin + state.url });
      return false;
    }
    return true;
  }
}
```

> Em projetos sem Keycloak (ex.: cursos/Firebase), use o guard funcional (`CanActivateFn`) descrito abaixo.

---

## Regras Obrigatórias de Rota

- Aplicar guard na rota protegida com canActivate: [authGuard]
- Manter login público e painel protegido

## Regras Obrigatórias do Auth Guard

- Usar CanActivateFn com inject()
- Ler token via AuthService.getToken()
- Sem token: negar acesso e redirecionar para /login
- Com token: permitir acesso

## Padrão de Redirecionamento

- Preferir retorno declarativo com UrlTree
- Exemplo: router.createUrlTree(['/login'])
- Evitar navegação imperativa quando retorno declarativo resolver

## Cenários Mínimos de Teste

- Cenário 1: sem token, ao acessar rota protegida deve redirecionar para /login
- Cenário 2: com token, ao acessar rota protegida deve permitir entrada

## Escopo da Etapa

- Nesta fase, o guard valida apenas existência de token
- Validação de expiração (exp) e roles fica para etapa posterior

---

## Autenticação em Micro Frontends (MFE)

Em arquitetura MFE com Single-SPA, a autenticação exige cuidados adicionais pois múltiplas aplicações Angular coexistem no mesmo host.

### Regras obrigatórias

- Todos os MFEs de Aplicação devem **compartilhar o mesmo token JWT** obtido pelo Root Config
- **Todo o código de autenticação e autorização** (obtenção, renovação e exposição do token) deve residir em um **módulo utilitário** compartilhado — escrito em TypeScript puro
- O módulo utilitário usa o **adaptador `keycloak-js`** diretamente (não `keycloak-angular`, que é exclusivo para SPAs Angular autossuficientes)
- Cada MFE de Aplicação **ainda deve implementar** seu próprio interceptor HTTP e guard de rotas, consumindo o token exposto pelo módulo utilitário

### Módulo utilitário de autenticação (TypeScript puro)

```ts
// auth-utility/src/auth.service.ts
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://server:port/auth',
  realm: 'realm',
  clientId: 'client-id',
});

let initialized = false;

export async function initAuth(): Promise<void> {
  if (initialized) return;
  await keycloak.init({ onLoad: 'check-sso' });
  initialized = true;
}

export function getToken(): string | undefined {
  return keycloak.token;
}

export function isAuthenticated(): boolean {
  return keycloak.authenticated ?? false;
}

export async function login(): Promise<void> {
  await keycloak.login();
}

export async function logout(): Promise<void> {
  await keycloak.logout();
}
```

### Interceptor no MFE Angular — consumindo o utilitário

```ts
// interceptors/auth.interceptor.ts (dentro do MFE Angular)
import { HttpInterceptorFn } from '@angular/common/http';
import { getToken } from '@caixa/auth-utility'; // módulo utilitário

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### Guard no MFE Angular — consumindo o utilitário

```ts
// guards/auth.guard.ts (dentro do MFE Angular)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAuthenticated, login } from '@caixa/auth-utility';

export const authGuard: CanActivateFn = async () => {
  if (isAuthenticated()) return true;
  await login();
  return false;
};
```

### Resumo de responsabilidades

| Responsabilidade | Onde fica |
|---|---|
| Inicialização do Keycloak | Módulo utilitário (TS puro) |
| Obtenção e renovação do token | Módulo utilitário (TS puro) |
| Header `Authorization` nas requisições | Interceptor em cada MFE Angular |
| Proteção de rotas | Guard em cada MFE Angular |
| Exposição do token para os MFEs | Módulo utilitário via `getToken()` |

