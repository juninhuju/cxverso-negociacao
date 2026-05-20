# Copilot Instructions

Arquivo gerado automaticamente por scripts/copilot-instructions.ps1.
Fonte: C:\Desenvolvimento\Projects\negocia-caixa\copilot-instructions
Gerado em: 2026-05-15 15:38:16

---

## Fonte: copilot-instructions.md

# 📘 copilot-instructions.md

## Instruções Oficiais - Projeto Angular 19 + NgRx 19

Este documento é normativo. Toda sugestão de código deve seguir estas regras.

---

## Índice

- [Objetivo do Agente](#objetivo-do-agente)
- [Checklist Obrigatório (PRs / Novos Arquivos)](#checklist-obrigatório-prs--novos-arquivos)
- [Configuração Assumida (TypeScript)](#configuração-assumida-typescript)
- [Regras Fundamentais (Canônicas)](#regras-fundamentais-canônicas)
- [Arquitetura Obrigatória (src/app)](#arquitetura-obrigatória-srcapp)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Padrões por Camada](#padrões-por-camada)
- [Roteamento](#roteamento)
- [NgRx 19 - Padrão Global](#ngrx-19---padrão-global)
- [NgRx vs Signals (Regra Crítica)](#ngrx-vs-signals-regra-crítica)
- [Signals e API Moderna Angular](#signals-e-api-moderna-angular)
- [Signal Inputs, Outputs e Model](#signal-inputs-outputs-e-model)
- [Signal Queries](#signal-queries)
- [RxJS Interop](#rxjs-interop)
- [Templates e Control Flow](#templates-e-control-flow)
- [Host Binding com Signals](#host-binding-com-signals)
- [Injeção de Dependências](#injeção-de-dependências)
- [Testes Unitários (Jest)](#testes-unitários-jest)
- [Acessibilidade (Obrigatório)](#acessibilidade-obrigatório)
- [Padrões Proibidos (Resumo)](#padrões-proibidos-resumo)
- [Boas Práticas Gerais](#boas-práticas-gerais)
- [Condicionais em TypeScript](#condicionais-em-typescript)
- [Manipulação de Arrays (reduce)](#manipulação-de-arrays-reduce)
- [Exemplos Práticos](#exemplos-práticos)
- [Documentação e Governança](#documentação-e-governança)
- [Convenções Operacionais](#convenções-operacionais)
- [Manutenção e Atualização](#manutenção-e-atualização)
- [Referência Operacional (Docs)](#referência-operacional-docs)
- [Bibliotecas Recomendadas](#bibliotecas-recomendadas)
- [Referências Oficiais](#referências-oficiais)
- [Prioridades do Agente](#prioridades-do-agente)
- [Resultado Esperado](#resultado-esperado)

---

## Objetivo do Agente

Você atua como desenvolvedor Angular sênior, com foco em:

- Angular 19+ (standalone, sem NgModule)
- NgRx 19+
- Signals (API moderna)
- TypeScript strict
- Testes com Jest
- Código limpo, escalável, testável, acessível e aderente a SOLID

---

## Checklist Obrigatório (PRs / Novos Arquivos)

- [ ] Código segue padrões deste documento
- [ ] Tipagem estrita sem any
- [ ] Arquitetura aderente a este documento
- [ ] Princípios SOLID aplicados
- [ ] Testes unitários escritos e passando (cobertura >= 80%)
- [ ] ng lint e ng test sem erros
- [ ] Documentação atualizada (JSDoc, README, docs)
- [ ] Commits no padrão Conventional Commits
- [ ] Dependências revisadas

---

## Configuração Assumida (TypeScript)

Assuma no mínimo:

```json
{
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "rootDir": "./src",
    "strict": true
  }
}
```

### Inclusão no angular.json para auto-formatação de Pipes

```json
"i18n": {
  "sourceLocale": "pt",
  "locales": {
    "pt-BR": "src/locale/messages.pt-BR.xlf"
  }
}
```

---

## Regras Fundamentais (Canônicas)

Estas regras valem para todo o projeto e não devem ser duplicadas em conflito:

- Nunca usar any
- Sempre tipar parâmetros e retornos
- Preferir readonly quando aplicável
- Não suprimir erro de tipagem
- Usar inject() para DI
- Não usar constructor para DI
- Componentes standalone por padrão
- Delegar regra de negócio para services/effects
- Não fazer subscribe() manual em componente
- Usar environment para configurações de ambiente
- Estado sempre imutável
- Aplicar SOLID em components, services, states e demais camadas
- Em projetos institucionais CAIXA: priorizar o Design System SIDSC/DSC, usar tokens `--dsc-color-*` e nunca criar UI paralela ao DSC
- Em projetos do curso (Firebase): usar CSS custom properties próprias (`--page-bg`, `--card-bg`, etc.) e temas light/dark via classes no `<body>`

---

## Arquitetura Obrigatória (src/app)

### Padrão Firebase + Signals (projetos do curso)

```text
app/
  core/                    <- serviços singleton globais
    auth/
      auth.service.ts
      guards/auth.guard.ts
      interceptors/auth.interceptor.ts
    preferences/preferences.service.ts
    tokens/storage.token.ts
  features/                <- features organizadas por domínio
    login/
    nome-feature/
      components/
      models/
      services/
  pipes/                   <- pipes customizados
  services/                <- facades globais
  shared/
    components/
  app.config.ts
  app.routes.ts
  app.ts
```

### Padrão NgRx (projetos enterprise com estado global complexo)

```text
app/
  components/
  guards/
  models/
  services/
  shared/
  states/
  app.config.ts
  app.routes.ts
```

Regras comuns:

- Não usar NgModule
- Não criar AppRoutingModule
- Rotas centralizadas em app.routes.ts
- Preferir lazy loading por feature com loadComponent

### Padrão CAIXA/Institucional (projetos SPA com Keycloak/SISET)

Estrutura adaptada às diretrizes da Arquitetura de Referência SPA da CAIXA para Angular standalone:

```text
app/
  core/                         <- serviços singleton — uma única instância
    auth/
      auth.service.ts
      keycloak.service.ts
    guards/
      auth.guard.ts             <- usa KeycloakAuthGuard ou CanActivateFn + inject()
    interceptors/
      auth.interceptor.ts       <- injeta header Authorization com token JWT
    services/
    layout/
  features/                     <- cada feature carregada por lazy loading
    feature1/
      feature1.component.ts
      feature1.component.html
      feature1.component.scss
      feature1.component.spec.ts
      feature1.service.ts
      feature1.routes.ts
    feature2/
      components/               <- subpasta quando a feature tem mais de 1 componente
      models/
      feature2.routes.ts
      feature2.service.ts
  shared/
    components/
    models/
    directives/
    pipes/
  app.config.ts
  app.routes.ts
```

Regras obrigatórias (padrão CAIXA):

- `core/` contém exclusivamente serviços singleton: autenticação, interceptors, guards globais e layout
- Cada feature deve ser lazy (`loadComponent` / `loadChildren`) — nunca incluída no bundle principal
- Features com mais de um componente devem usar subpastas; **nenhuma pasta deve ter mais de 6 arquivos**
- `shared/` deve ser totalmente independente: sem referência a `core/` ou a outras features
- Toda requisição HTTP deve incluir o header `Authorization: Bearer <token>` via interceptor
- Qualquer tecnologia diferente de Angular precisa ser apresentada e aprovada pela **SUART** antes do uso

---

## Convenções de Nomenclatura

- Arquivos: kebab-case
- Classes, interfaces, enums: PascalCase
- Variáveis e funções: camelCase

---

## Padrões por Camada

Services:
- Um serviço por responsabilidade
- Sempre inject() para dependências
- Devem ter testes unitários

Guards:
- Focados em regra de acesso
- Usar CanActivateFn + inject()
- Cobrir cenários permitido, bloqueado e redirecionamento

Models:
- Apenas tipos/interfaces
- Sem regra de negócio

Components:
- Separados por domínio
- Finos e orientados a exibição
- Sem regra de negócio
- Arquivo de teste junto ao componente

Shared:
- Componentes/utilitários reutilizáveis

---

## Roteamento

- Todas as rotas ficam em `app.routes.ts`
- Usar **lazy loading** por feature com `loadComponent`
- Em componentes standalone, importar individualmente as diretivas de roteamento:
  - `RouterLink`
  - `RouterLinkActive`
  - `RouterOutlet`
- Não navegar usando `Router` dentro de services

---

## Feature — Unidade de Domínio do Projeto

Uma feature é um agrupamento coeso de tudo que pertence a um mesmo domínio de negócio.
Cada feature é autossuficiente e contém seus próprios componentes, estado, serviço e rota.

Estrutura de uma feature — **Padrão Firebase + Signals** (projetos do curso):

```text
features/
  nome-feature/
    components/
      nome-feature/
        nome-feature.ts
        nome-feature.html
        nome-feature.scss
        nome-feature.spec.ts
    models/
      nome-feature.model.ts
    services/
      nome-feature.service.ts  <- estado com signal(), computed()
```

Facade global (em `services/`):

```text
services/
  nome-feature.facade.ts       <- injeta o service, expõe computed signals
```

Estrutura de uma feature — **Padrão NgRx** (projetos enterprise):

```text
states/
  nome-feature/
    nome-feature.actions.ts
    nome-feature.reducer.ts
    nome-feature.effects.ts
    nome-feature.selectors.ts
    nome-feature.state.ts
    nome-feature.facade.ts     <- Facade obrigatório
```

Regras de feature (ambos os padrões):

- Facade é a única porta de entrada para o estado da feature nos componentes
- Componentes da feature conhecem apenas o Facade da própria feature
- Features não se importam diretamente entre si; comunicação via shared ou eventos
- Rota da feature usa `loadComponent` (lazy loading obrigatório)
- Nomenclatura consistente: o nome da feature é o prefixo de todos os arquivos da pasta

---

## NgRx 19 - Padrão Global

Estrutura por feature:

```text
states/feature-x/
  feature-x.actions.ts
  feature-x.reducer.ts
  feature-x.effects.ts
  feature-x.selectors.ts
  feature-x.state.ts
  feature-x.facade.ts
```

Regras:

- Actions no formato: [Feature] Verbo Objeto
- State deve ter: data, loading, error
- Toda feature com chamada remota deve modelar erro e expor erro para UI
- Reducers devem ser puros
- Effects apenas para fluxo assíncrono
- Effects devem emitir success ou failure
- Nunca mutar estado diretamente

---

## NgRx vs Signals (Regra Crítica)

### Projetos do curso (Firebase + Firestore)

- Estado global e local: **Signals puros** (`signal()`, `computed()`, `effect()`)
- Estado fica nos próprios services (`signal<T[]>([])`)
- Facade injeta o Service e expõe `computed()` signals — **não usa Store**
- Não criar pasta `states/`, não instalar NgRx
- `effect()` apenas para efeitos colaterais (nunca para regra de negócio)

### Projetos enterprise (NgRx)

- Estado global/compartilhado: NgRx
- Estado local de UI (flags, loading local): Signals
- Regra de negócio: Service/Effect
- Proibido lógica de negócio em signals

---

## Facade Service (Obrigatório em todas as features)

O componente só conhece o Facade — independente de usar NgRx ou Signals.

### Facade com Signals (padrão do curso / Firebase)

Regras:

- Facade injeta o Service via `inject(NomeService)`
- Expõe `computed()` signals de leitura e métodos de escrita
- Componente nunca injeta o Service diretamente
- Facade não contém regra de negócio (delega para o Service)

Exemplo:

```ts
import { inject, Injectable, computed } from '@angular/core';
import { SolicitacoesService } from '../features/solicitacoes/services/solicitacoes.service';

@Injectable({ providedIn: 'root' })
export class SolicitacoesFacade {
  private service = inject(SolicitacoesService);

  // Leitura
  readonly listaFiltrada = computed(() =>
    this.service.solicitacoes().filter(s => /* filtro */ true)
  );
  readonly loading = this.service.loading;
  readonly error   = this.service.error;

  // Escrita
  carregar(): void { this.service.carregar(); }
  criar(dados: Partial<Solicitacao>): void { this.service.criar(dados); }
}
```

Uso no componente:

```ts
import { Component, inject } from '@angular/core';
import { SolicitacoesFacade } from '../../services/solicitacoes.facade';

@Component({ /* ... */ })
export class SolicitacaoListaComponent {
  private facade = inject(SolicitacoesFacade);

  readonly lista    = this.facade.listaFiltrada;
  readonly loading  = this.facade.loading;
  readonly error    = this.facade.error;

  carregar(): void { this.facade.carregar(); }
}
```

### Facade com NgRx (projetos enterprise)

Regras:

- Facade injeta Store via inject(Store)
- Expõe Observables/Signals de leitura e métodos de escrita
- Componente nunca injeta Store, nunca chama store.dispatch() diretamente
- Facade não contém regra de negócio

Estrutura por feature:

```text
states/feature-x/
  feature-x.actions.ts
  feature-x.reducer.ts
  feature-x.effects.ts
  feature-x.selectors.ts
  feature-x.state.ts
  feature-x.facade.ts
```

Exemplo:

```ts
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ProdutosActions } from './produtos.actions';
import { selectProdutos, selectProdutosLoading, selectProdutosError } from './produtos.selectors';

@Injectable({ providedIn: 'root' })
export class ProdutosFacade {
  private store = inject(Store);

  readonly produtos$ = this.store.select(selectProdutos);
  readonly loading$  = this.store.select(selectProdutosLoading);
  readonly error$    = this.store.select(selectProdutosError);

  carregar(categoria: string): void {
    this.store.dispatch(ProdutosActions.carregar({ categoria }));
  }
}
```

Uso no componente:

```ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProdutosFacade } from '../states/produtos/produtos.facade';

@Component({ /* ... */ })
export class ProdutosComponent {
  private facade = inject(ProdutosFacade);

  readonly produtos = toSignal(this.facade.produtos$, { initialValue: [] });
  readonly loading  = toSignal(this.facade.loading$,  { initialValue: false });
  readonly error    = toSignal(this.facade.error$,    { initialValue: null });

  carregar(categoria: string): void {
    this.facade.carregar(categoria);
  }
}
```

❌ Componente não deve injetar `Store` diretamente
❌ Componente não deve chamar `store.dispatch()` ou `store.select()` diretamente

---

## Signals e API Moderna Angular

Comunicação entre componentes:

- Usar input(), output(), model()
- Não usar @Input(), @Output(), EventEmitter

Queries de DOM:

- Usar viewChild(), viewChildren(), contentChild(), contentChildren()
- Não usar @ViewChild(), @ViewChildren(), @ContentChild(), @ContentChildren()

Host bindings/listeners:

- Usar propriedade host no metadata
- Não usar @HostBinding() e @HostListener()

RxJS interop:

- Preferir toSignal() e toObservable() de @angular/core/rxjs-interop
- Preferir toSignal() em novos componentes quando fizer sentido

---

## Signal Inputs, Outputs e Model (Angular 19)

### `input()` — substitui `@Input()`
```ts
import { Component, input } from '@angular/core';

@Component({ /* ... */ })
export class ProdutoCardComponent {
  readonly produto = input.required<Produto>();
  readonly destaque = input(false);  // valor padrão
}
```

### `output()` — substitui `@Output()`
```ts
import { Component, output } from '@angular/core';

@Component({ /* ... */ })
export class ProdutoCardComponent {
  readonly adicionado = output<Produto>();

  adicionar(produto: Produto): void {
    this.adicionado.emit(produto);
  }
}
```

### `model()` — two-way binding com signals
```ts
import { Component, model } from '@angular/core';

@Component({ /* ... */ })
export class FiltroComponent {
  readonly termo = model('');
}
```
Uso no template pai:
```html
<app-filtro [(termo)]="termoBusca" />
```

❌ Não usar `@Input()`, `@Output()` com `EventEmitter`

---

## Signal Queries

### `viewChild()` — substitui `@ViewChild()`
```ts
import { Component, viewChild, ElementRef } from '@angular/core';

@Component({ /* ... */ })
export class FormComponent {
  readonly inputNome = viewChild.required<ElementRef>('inputNome');

  focar(): void {
    this.inputNome().nativeElement.focus();
  }
}
```

### `viewChildren()` — substitui `@ViewChildren()`
```ts
import { Component, viewChildren } from '@angular/core';
import { ProdutoCardComponent } from './produto-card.component';

@Component({ /* ... */ })
export class ListaComponent {
  readonly cards = viewChildren(ProdutoCardComponent);
}
```

### `contentChild()` / `contentChildren()`
```ts
import { Component, contentChild } from '@angular/core';

@Component({ /* ... */ })
export class TabsComponent {
  readonly tabAtiva = contentChild.required(TabComponent);
}
```

❌ Não usar `@ViewChild()`, `@ViewChildren()`, `@ContentChild()`, `@ContentChildren()`

---

## RxJS Interop (Angular 19)

### `toSignal()` — converte Observable em Signal
```ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProdutoService } from '../services/produto.service';

@Component({ /* ... */ })
export class ProdutosComponent {
  private produtoService = inject(ProdutoService);
  readonly produtos = toSignal(this.produtoService.getAll(), { initialValue: [] });
}
```

### `toObservable()` — converte Signal em Observable
```ts
import { signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

readonly filtro = signal('');
readonly filtro$ = toObservable(this.filtro);
```

✅ Preferir `toSignal()` sobre `async pipe` para novos componentes

---

## Host Binding com Signals

✅ Usar a propriedade **`host`** no metadata do `@Component` / `@Directive` com **signals**:

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-botao',
  host: {
    '[class.active]': 'isActive()',
    '[attr.aria-pressed]': 'isActive()',
    '(click)': 'onClick()',
    '(keydown.enter)': 'onClick()',
  },
  template: `<ng-content />`,
})
export class BotaoComponent {
  readonly isActive = signal(false);

  onClick(): void {
    this.isActive.update(v => !v);
  }
}
```

❌ Não usar `@HostBinding()`, `@HostListener()`

---

## Templates e Control Flow

Usar apenas novo control flow:

- @if/@else
- @for/@empty
- @switch
- @defer/@loading/@placeholder

Regras obrigatórias:

- Toda lista com @for deve ter @empty
- Fluxo assíncrono deve exibir erro explicitamente
- Mensagens de empty e erro devem ser claras ao usuário

Proibido:

- *ngIf, *ngFor, *ngSwitch/*ngSwitchCase
- ng-template para controle de fluxo

---

## Injeção de Dependências

Padrão obrigatório:

```ts
private http = inject(HttpClient);
```

Proibido:

- DI por constructor

---

## Testes Unitários

- Framework aceito: **Karma + Jasmine** (padrão Angular CLI) ou **Jest**
- Cobertura mínima: 80%
- Um arquivo `*.spec.ts` por arquivo principal
- Mockar dependências externas
- Cobrir sucesso e erro
- Testar no mínimo: services, guards, facades e componentes críticos
- Usar `describe` e `it` com descrições claras
- Adotar TDD sempre que possível

> Em projetos do curso com Angular CLI padrão, Karma + Jasmine é o framework de testes utilizado.
> Jest é recomendado para projetos enterprise com configuração customizada.

---

## Acessibilidade (Obrigatório)

- Todo componente interativo deve ser acessível por teclado (Tab, Shift+Tab, Enter, Space)
- Todo controle interativo deve ter nome acessível (texto visível, aria-label ou aria-labelledby)
- Toda imagem informativa deve ter alt descritivo; imagens decorativas devem usar alt=""
- Campos de formulário devem ter associação explícita entre label e controle
- Mensagens de erro e validação devem ser anunciáveis por leitor de tela (aria-live quando aplicável)
- Mudanças de estado relevantes (carregamento, sucesso, erro, vazio) devem ter feedback textual acessível
- Não usar apenas cor para comunicar significado; manter contraste adequado de texto e elementos de foco
- Preservar ordem lógica de foco e manter indicador de foco visível
- Preferir HTML semântico (button, nav, main, section, table) antes de recorrer a role
- Sempre validar acessibilidade com leitor de tela e navegação exclusiva por teclado nos fluxos principais

---

## Boas Práticas Gerais

- Usar `inject()` ao invés de `constructor`
- Componentes são standalone por padrão no Angular 19 (não declarar `standalone: true`)
- Usar `toSignal()` para converter observables em signals (preferido) ou `async pipe` quando necessário
- Usar `input()`, `output()`, `model()` ao invés de `@Input()`, `@Output()`
- Usar `viewChild()`, `contentChild()` ao invés de `@ViewChild()`, `@ContentChild()`
- Evitar lógica de negócio em componentes
- Delegar regras para services ou effects
- Usar `environment` para variáveis de ambiente
- Adotar **mobile first**
- Usar lazy loading sempre que aplicável

---

## Condicionais em TypeScript

- Use `switch` quando comparar **a mesma variável** com vários valores fixos (ex.: `tipoTransacao`)
- Use `if/else` para regras com expressões lógicas, intervalos ou condições compostas
- Priorize legibilidade: se houver muitos caminhos de valor exato, prefira `switch`

---

## Manipulação de Arrays (reduce)

- Prefira `reduce()` a loops imperativos (`for`, `forEach`) quando o objetivo é **produzir um valor derivado** a partir de um array
- Alinhado com imutabilidade — não modifica o array original
- Indicado em services, selectors NgRx e transformações de dados
- Exemplos de uso:
  - Somar saldo de transações: `transacoes.reduce((acc, t) => acc + t.valor, 0)`
  - Agrupar itens por tipo: `transacoes.reduce((acc, t) => ({ ...acc, [t.tipo]: [...(acc[t.tipo] ?? []), t] }), {})`
- Combine com `map()` e `filter()` antes do `reduce()` para melhor legibilidade

---

## Exemplos Práticos

### Service
```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);

  getAll(categoria: string) {
    return this.http.get<Produto[]>(`/api/produtos?categoria=${categoria}`);
  }
}
```

### Guard
```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
```

### Action NgRx
```ts
import { createAction, props } from '@ngrx/store';

export const carregarProdutos = createAction(
  '[Produtos] Carregar Produtos',
  props<{ categoria: string }>()
);

export const carregarProdutosSuccess = createAction(
  '[Produtos] Carregar Produtos Success',
  props<{ produtos: Produto[] }>()
);

export const carregarProdutosFailure = createAction(
  '[Produtos] Carregar Produtos Failure',
  props<{ error: string }>()
);
```

### Effect NgRx
```ts
import { inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { ProdutoService } from '../services/produto.service';
import { carregarProdutos, carregarProdutosSuccess, carregarProdutosFailure } from './produtos.actions';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const carregarProdutos$ = createEffect(
  (actions$ = inject(Actions), produtoService = inject(ProdutoService)) =>
    actions$.pipe(
      ofType(carregarProdutos),
      switchMap(action =>
        produtoService.getAll(action.categoria).pipe(
          map(produtos => carregarProdutosSuccess({ produtos })),
          catchError(error => of(carregarProdutosFailure({ error: error.message })))
        )
      )
    ),
  { functional: true }
);
```

### State NgRx (arquivo `feature-x.state.ts`)
```ts
import { Produto } from '../../models/produto';

export interface ProdutosState {
  data: Produto[];
  loading: boolean;
  error: string | null;
}

export const initialState: ProdutosState = {
  data: [],
  loading: false,
  error: null,
};
```

### Reducer NgRx
```ts
import { createReducer, on } from '@ngrx/store';
import { initialState } from './produtos.state';
import * as ProdutosActions from './produtos.actions';

export const produtosReducer = createReducer(
  initialState,
  on(ProdutosActions.carregarProdutos, state => ({ ...state, loading: true })),
  on(ProdutosActions.carregarProdutosSuccess, (state, { produtos }) =>
    ({ ...state, data: produtos, loading: false })),
  on(ProdutosActions.carregarProdutosFailure, (state, { error }) =>
    ({ ...state, error, loading: false }))
);
```

### Selector NgRx
```ts
import { createSelector } from '@ngrx/store';

export const selectProdutosState = (state: AppState) => state.produtos;
export const selectProdutos = createSelector(selectProdutosState, s => s.data);
export const selectProdutosLoading = createSelector(selectProdutosState, s => s.loading);
export const selectProdutosError = createSelector(selectProdutosState, s => s.error);
```

### Teste Unitário com Jest
```ts
import { TestBed } from '@angular/core/testing';
import { ProdutoService } from './produto.service';
import { HttpClient } from '@angular/common/http';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let httpMock: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProdutoService,
        { provide: HttpClient, useValue: { get: jest.fn() } },
      ],
    });
    service = TestBed.inject(ProdutoService);
    httpMock = TestBed.inject(HttpClient);
  });

  it('deve retornar produtos', () => {
    const mockProdutos = [{ id: 1, nome: 'Produto 1' }];
    jest.spyOn(httpMock, 'get').mockReturnValue(of(mockProdutos));

    service.getAll('eletrônicos').subscribe(produtos => {
      expect(produtos).toEqual(mockProdutos);
    });
  });

  it('deve falhar ao buscar produtos', () => {
    jest.spyOn(httpMock, 'get').mockReturnValue(throwError(() => new Error('Network error')));

    service.getAll('eletrônicos').subscribe(
      () => fail('should not succeed'),
      error => expect(error.message).toBe('Network error')
    );
  });
});
```

### Exemplo de JSDoc
```ts
/**
 * Serviço responsável por gerenciar autenticação do usuário.
 * Fornece métodos para login, logout e verificação de autenticação.
 * @see {@link AuthGuard} para proteção de rotas
 * @example
 * const auth = inject(AuthService);
 * if (auth.isLoggedIn()) { ... }
 */
export class AuthService {
  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} true se houver token válido
   */
  isLoggedIn(): boolean { /* ... */ }
}
```

### Uso de environment
```ts
import { environment } from '../environments/environment';

const apiUrl = environment.apiUrl;
const apiKey = environment.apiKey;
```

### Componente com Signals e Control Flow
```ts
import { Component, inject, input, output } from '@angular/core';
import { signal } from '@angular/core';
import { ProdutoService } from '../services/produto.service';

@Component({
  selector: 'app-lista-produtos',
  template: `
    @if (produtos().length > 0) {
      @for (produto of produtos(); track produto.id) {
        <app-produto-card
          [produto]="produto"
          (adicionado)="adicionarCarrinho($event)"
        />
      }
    } @else @if (carregando()) {
      <p>Carregando produtos...</p>
    } @else @if (erro()) {
      <p class="error">{{ erro() }}</p>
    } @else {
      <p>Nenhum produto encontrado.</p>
    }
  `,
})
export class ListaProdutosComponent {
  private produtoService = inject(ProdutoService);

  categoria = input.required<string>();
  produtoAdicionado = output<Produto>();

  produtos = signal<Produto[]>([]);
  carregando = signal(false);
  erro = signal<string | null>(null);

  constructor() {
    this.carregarProdutos();
  }

  private carregarProdutos(): void {
    this.carregando.set(true);
    this.produtoService.getAll(this.categoria()).subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.erro.set(null);
      },
      error: (err) => {
        this.erro.set(err.message);
        this.produtos.set([]);
      },
      complete: () => this.carregando.set(false),
    });
  }

  adicionarCarrinho(produto: Produto): void {
    this.produtoAdicionado.emit(produto);
  }
}
```

---

## Padrões Proibidos (Resumo)

- ❌ `any`
- ❌ `subscribe()` manual em componentes
- ❌ Lógica de negócio em componentes
- ❌ DI via `constructor`
- ❌ `@HostBinding()` e `@HostListener()` (usar propriedade `host` com signals)
- ❌ `@Input()` e `@Output()` com `EventEmitter` (usar `input()`, `output()`, `model()`)
- ❌ `@ViewChild()` e `@ContentChild()` (usar `viewChild()`, `contentChild()`)
- ❌ Estado mutável
- ❌ Acesso direto à `Store` em componentes (usar Facade)
- ❌ Acesso direto à `Store` dentro de services
- ❌ `store.dispatch()` ou `store.select()` chamados diretamente no componente
- ❌ `*ngIf`, `*ngFor`, `*ngSwitch/*ngSwitchCase`
- ❌ `<ng-template>` para controle de fluxo
- ❌ `NgModule` (usar standalone)
- ❌ `AppRoutingModule` (usar `app.routes.ts`)

---

## Documentação e Governança

- Manter README atualizado (uso, build, testes, arquitetura)
- Manter docs/ para decisões arquiteturais, fluxos e integrações
- Usar JSDoc em services, guards e effects
- Atualizar documentação quando houver mudança de regra/arquitetura

---

## Convenções Operacionais

- Rodar ng lint e ng test antes de commit/push
- Corrigir erros de lint antes de subir código
- Adotar Conventional Commits
- Revisar periodicamente este documento e dependências do projeto

---

## Manutenção e Atualização

- Revisar a documentação a cada release
- Manter dependências atualizadas
- Revisar periodicamente padrões e exemplos deste arquivo

---

## Referência Operacional (Docs)

Para manter este arquivo enxuto, os detalhes operacionais ficam em:

- [performance.md](performance.md)
- [offline-pwa.md](offline-pwa.md)
- [guard-autenticacao.md](guard-autenticacao.md)
- [heuristicas-codigo.md](heuristicas-codigo.md)
- [clean-code-architecture-design-patterns.md](clean-code-architecture-design-patterns.md)

---

## Micro Frontends (MFE)

### Visão Geral

Arquitetura que compõe aplicações de grande porte a partir de módulos independentes com escopo funcional e ciclo de vida próprios. Viabiliza times autônomos com releases independentes, isolamento de falhas e governança corporativa centralizada.

### Padrões obrigatórios

| Aspecto | Decisão |
|---|---|
| Tecnologia de MFE de Aplicação | **Angular** (exclusivo — outras tecnologias exigem aprovação SUART) |
| Orquestração | **Single-SPA** |
| Composição intra-framework | **Module Federation (Webpack 5)** quando MFEs compartilham domínio técnico |
| Resolução de dependências | **Import Maps** no host para módulos ES e dependências compartilhadas |
| Módulos utilitários | **JavaScript/TypeScript puro** (Single-SPA não suporta utilitários em Angular) |

### Tipos de módulo

**Root Config** — portal de entrada: arquivo HTML/EJS único + JavaScript que registra os MFEs. Deve ser agnóstico a framework. Cada MFE registrado precisa fornecer:
- Nome único
- Função de carregamento do código
- Função que determina quando o MFE está ativo/inativo

**MFE de Aplicação** — SPA ou Web Component que sabe inicializar, montar e desmontar a si mesmo do DOM. Não possui página HTML própria; coexiste com outros MFEs na página do host.

**Módulo utilitário** — exporta APIs compartilhadas (design system, serviços de autenticação, helpers). **Não é um MFE visual.** Deve ser escrito em TypeScript puro.

### Requisitos obrigatórios de cada MFE

- Executável isoladamente em um nó DOM arbitrário
- **Não instalar** bibliotecas, fontes ou estilos em escopo global; herdar estilos compartilhados do host
- Agnóstico em relação ao Root Config: inicialização, montagem e desmontagem bem definidas
- Instanciável múltiplas vezes na mesma página com configurações distintas
- Cumprir metas de acessibilidade (WCAG), performance (orçamentos de carga), segurança (CSP, Trusted Types, SRI) e observabilidade (tracing, métricas, logs)

### Lifecycle Angular com Single-SPA

```ts
// main.single-spa.ts
import { NgZone } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { singleSpaAngular, getSingleSpaExtraProviders } from 'single-spa-angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const lifecycles = singleSpaAngular({
  bootstrapFunction: () =>
    bootstrapApplication(AppComponent, {
      ...appConfig,
      providers: [...(appConfig.providers ?? []), getSingleSpaExtraProviders()],
    }),
  template: '<app-root />',
  Router,
  NavigationStart,
  NgZone,
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### Bibliotecas compartilhadas — regra de carregamento

- **Dependências Angular** (core, common, router, forms, etc.) devem ser carregadas **uma única vez** pelo Root Config via Import Maps e compartilhadas com todos os MFEs
- Cada MFE carrega apenas bibliotecas exclusivas ao seu domínio
- Em casos excepcionais de versão específica, garantir ausência de conflito antes de incluir

```json
// import-map.json (Root Config)
{
  "imports": {
    "@angular/core": "https://cdn.exemplo.caixa.gov.br/@angular/core@19.x/index.js",
    "@angular/common": "https://cdn.exemplo.caixa.gov.br/@angular/common@19.x/index.js",
    "single-spa": "https://cdn.exemplo.caixa.gov.br/single-spa@5.x/lib/system/single-spa.min.js"
  }
}
```

### Module Federation — compartilhamento Angular

```js
// webpack.config.js (MFE de Aplicação)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeNomeFeature',
      filename: 'remoteEntry.js',
      exposes: {
        './NomeFeatureModule': './src/app/features/nome-feature/nome-feature.routes.ts',
      },
      shared: {
        '@angular/core':   { singleton: true, strictVersion: true, requiredVersion: '^19.0.0' },
        '@angular/common': { singleton: true, strictVersion: true, requiredVersion: '^19.0.0' },
        '@angular/router': { singleton: true, strictVersion: true, requiredVersion: '^19.0.0' },
      },
    }),
  ],
};
```

### Segurança em MFE (obrigatório)

- **CSP restritiva no host**: bloquear inline script/style, usar nonces/hashes, `frame-ancestors`, `upgrade-insecure-requests` e `reporting`
- **Trusted Types**: habilitar para mitigar XSS DOM; políticas e sanitização explícitas
- **SRI (Subresource Integrity)**: exigir integridade para recursos externos (scripts/estilos)
- **BFF obrigatório**: toda comunicação com sistemas internos deve ocorrer via BFFs (mTLS quando aplicável); MFEs **nunca** acessam APIs internas diretamente
- Autenticação: JWT compartilhado entre todos os MFEs; lógica de auth centralizada em módulo utilitário — detalhes em [guard-autenticacao.md](guard-autenticacao.md)

### Integração com MFEs de empresas externas

- Todo código de MFEs externos deve ser **internalizado** em repositórios oficiais da CAIXA antes de qualquer execução
- Build exclusivamente em pipelines internos com SAST, DAST e varredura de malware
- MFEs externos podem ser executados em `<iframe sandbox>` com CSP e comunicação restrita via `postMessage`
- Toda comunicação via BFF interno com autenticação OAuth2 e API Manager; **vedada** conexão direta à internet pública
- Tecnologia diferente de Angular requer aprovação formal da SUART

---

### Guia de criação de projetos Single-SPA (CAIXA)

#### Pré-requisito: instalar o create-single-spa

```bash
npm install -g create-single-spa
```

#### Modo de carregamento obrigatório: tempo de execução (runtime)

Sempre usar **Import Maps** para importar os MFEs a partir de URLs publicadas. Isso permite que cada MFE seja atualizado e reimplantado **sem republicar** o Root Config.

> Carregamento em tempo de compilação (bundle junto ao Root) é **proibido** no âmbito CAIXA.

---

#### 1. Criando o Root Config

```bash
create-single-spa
```

Respostas obrigatórias:

| Pergunta | Resposta |
|---|---|
| Directory for new project | `[nome-do-diretório]` |
| Select type to generate | `single-spa root config` |
| Package manager | `npm` |
| Use Typescript? | `y` |
| Use single-spa Layout Engine? | `y` |
| Organization name | `cef` |

Após a criação, habilite o `zone.js` descomentando no `index.ejs`:

```html
<script src="https://cdn.jsdelivr.net/npm/zone.js@0.11.3/dist/zone.min.js"></script>
```

---

#### 2. Criando um MFE de Aplicação (Angular)

```bash
create-single-spa
```

Respostas obrigatórias:

| Pergunta | Resposta |
|---|---|
| Directory for new project | `[nome-do-diretório]` |
| Select type to generate | `single-spa application / parcel` |
| Framework | `angular` |
| Project name | `[nome-da-aplicação]` |
| Add Angular routing? | `Yes` |
| Stylesheet format | `SCSS` |
| Install single-spa-angular? | `y` |
| Use Angular routing? | `Yes` |
| Port | `[porta exclusiva, ex.: 4201]` |

Após a criação, execute `npm install` e ajuste o `app-routing.module.ts` para incluir `APP_BASE_HREF` e a rota coringa para `EmptyRouteComponent`:

```ts
import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

const routes: Routes = [{ path: '**', component: EmptyRouteComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
})
export class AppRoutingModule {}
```

Executar o MFE no modo Single-SPA:

```bash
npm run serve:single-spa:[nome-da-aplicação]
```

---

#### 3. Registrando o MFE no Root Config

**Passo 1** — Adicionar ao Import Map em `index.ejs`:

```html
<script type="systemjs-importmap">
  {
    "imports": {
      "@cef/[nome-da-aplicação]": "http://[servidor]:[porta]/main.js"
    }
  }
</script>
```

> Sempre importar o arquivo `main.js` publicado pelo MFE.

**Passo 2** — Registrar no bloco de importação do SystemJS:

```html
<script>
  System.import('@cef/root-config');
</script>
```

**Passo 3** — Associar o MFE a uma rota no arquivo de layout (`microfrontend-layout.html`):

```html
<single-spa-router>
  <application name="@cef/header"></application>

  <div class="container-fluid">
    <route path="/app1">
      <application name="@cef/app1"></application>
    </route>

    <route path="/app2">
      <application name="@cef/app2"></application>
    </route>

    <route default>
      <p>Nenhuma rota ativa.</p>
    </route>
  </div>
</single-spa-router>
```

> MFEs que devem estar **sempre visíveis** (ex.: header, footer) são declarados fora de `<route>`.

---

#### 4. Criando um módulo utilitário (TypeScript puro)

```bash
create-single-spa
```

Respostas obrigatórias:

| Pergunta | Resposta |
|---|---|
| Select type to generate | `in-browser utility module (styleguide, api, etc.)` |
| Framework | nenhum (TypeScript puro) |
| Organization name | `cef` |
| Project name | `[nome-do-utilitário]` (ex.: `auth`, `styleguide`) |

> Módulos utilitários exportam APIs compartilhadas (auth, design system, helpers). Não são MFEs visuais e não possuem DOM.

---

## BFF — Backend for Frontend

O padrão BFF deve ser adotado em projetos CAIXA quando o frontend precisa consumir múltiplos serviços backend, pois APIs REST genéricas tendem a não ser otimizadas para um canal específico, gerando excesso de requisições HTTP no cliente.

**Responsabilidades do BFF:**

- Expor um endpoint exclusivo e altamente especializado para o canal (web, mobile, etc.)
- Orquestrar chamadas a múltiplos serviços backend
- Combinar e transformar payloads em formato otimizado para o consumo daquele canal

**Regras obrigatórias:**

- O Angular **nunca** deve chamar múltiplos microsserviços diretamente quando existe BFF disponível
- Services Angular apontam para o endpoint do BFF, não para os microsserviços individuais
- O BFF é responsável pela composição de dados; o frontend é responsável apenas pela apresentação
- Modelar o retorno do BFF com interfaces TypeScript estritas (`interface BffResponse<T>`)

**Exemplo de service consumindo BFF:**

```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { DashboardData } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getDashboard(): Observable<DashboardData> {
    // Consome o BFF — que orquestra N microsserviços internamente
    return this.http.get<DashboardData>(`${environment.bffUrl}/dashboard`);
  }
}
```

---

## Bibliotecas Recomendadas

### Projetos do curso (Firebase + Signals)

- @angular/router
- @angular/forms
- @angular/fire (Firebase + Firestore + Auth)
- @angular/service-worker (PWA)
- @ngx-translate/core (i18n)
- ngx-mask (máscaras de input)
- rxjs

### Projetos enterprise (NgRx)

- @ngrx/store
- @ngrx/effects
- @ngrx/entity
- @ngrx/store-devtools

### Design System (projetos institucionais CAIXA)

- sidsc-components
- keycloak-angular (SSO/SISET — autenticação em SPAs Angular com Keycloak)
- keycloak-js (SSO/SISET — adaptador JavaScript para módulos utilitários MFE em TS puro)

### Micro Frontends (projetos MFE com Single-SPA)

- single-spa (orquestração de MFEs)
- single-spa-angular (lifecycle hooks Angular para Single-SPA)
- systemjs (carregador de módulos ES no host)

### Testes

- Karma + Jasmine (padrão Angular CLI — projetos do curso)
- jest (projetos enterprise com configuração customizada)

### Opcionais

- @angular/material
- angular-in-memory-web-api
- nanoid

---

## Referências Oficiais

- https://angular.dev
- https://ngrx.io
- https://jestjs.io
- https://www.conventionalcommits.org/pt-br/v1.0.0/

---

## Prioridades do Agente

1. Código limpo
2. Tipagem forte
3. Arquitetura previsível
4. Testes antes de features
5. Escalabilidade acima de atalhos
6. Seguir integralmente este documento

---

## Resultado Esperado

Todo código gerado deve ser:

- Pronto para produção
- Testável
- Aderente a Angular 19 + NgRx 19
- Livre de ambiguidade
- Com mínimo retrabalho humano

---

## Fonte: copilot-instructions-dsc.md

# SIDSC - DSC Angular

## Instrucoes Oficiais para Agente (Design System CAIXA)

---

## Visao Geral

Este projeto utiliza o SIDSC Angular - Design System da CAIXA, versao v19.1.4.

A biblioteca sidsc-components disponibiliza componentes Angular reutilizaveis para criacao de interfaces institucionais, consistentes, acessiveis e alinhadas ao padrao visual da CAIXA, no contexto do sistema SIDSC.

O agente deve sempre priorizar este Design System ao gerar codigo, exemplos ou sugestoes de UI.

---

## Principios do Design System

Ao gerar qualquer solucao visual, o agente deve garantir:

- Consistencia visual em todos os produtos
- Acessibilidade (WCAG: teclado, contraste, ARIA, labels)
- Reutilizacao de componentes existentes
- Aderencia institucional a identidade da CAIXA
- Documentacao clara e exemplos objetivos

---

## Instalacao da Biblioteca

### Angular CLI (recomendado)

```bash
ng add sidsc-components
```

Em workspace com multiplos projetos:

```bash
ng add sidsc-components --project <nome-do-projeto>
```

Este comando:

- instala sidsc-components
- adiciona automaticamente os estilos no angular.json

### Instalacao Manual (NPM)

```bash
npm i sidsc-components
```

Adicionar os estilos manualmente:

```json
{
  "styles": [
    "node_modules/sidsc-components/styles/main.scss"
  ]
}
```

---

## Uso de Componentes (Angular 19+ Standalone)

Sempre utilizar Standalone Components do Design System.

```ts
import { Component } from '@angular/core';
import { DscButtonComponent } from 'sidsc-components/dsc-button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DscButtonComponent],
  template: '<dsc-button label="Entrar"></dsc-button>'
})
export class AppComponent {}
```

### Regra fundamental

Nunca recriar componentes visuais que ja existam no SIDSC.

---

## Componentes Oficiais Disponiveis

### Estrutura e Navegacao

- DscHeader
- DscButtonHeader
- DscFooter
- DscBreadcrumb
- DscSidenav
- DscTabGroup
- DscStepper
- DscPaginator

### Acoes e Feedback

- DscButton
- DscAlert
- DscSnackbar
- DscDialog
- DscTooltip
- DscBadge
- DscProgressBar
- DscProgressSpinner

### Conteudo e Layout

- DscCard
- DscAccordion
- DscChips
- DscTags
- DscTable

### Formularios e Entrada de Dados

- DscInput
- DscInputCurrency
- DscInputFile
- DscTextarea
- DscSelect
- DscCheckbox
- DscRadioButton
- DscSwitch
- DscDatepicker

Regra de ouro:

Se existir um componente Dsc*, ele deve ser usado.

---

## Paleta de Cores e Tokens

### Paletas

- Fixa: cores institucionais da CAIXA
- Flexivel: uso restrito (ilustracoes, graficos, decorativos)
- Feedback: sucesso, erro, alerta, informacao

Todas as cores seguem o Guia da Marca CAIXA e foram adaptadas ao meio digital.

### Tokens de Cor (Obrigatorios)

Uso correto:

```css
background-color: var(--dsc-color-bg-highlight-7);
```

Proibido:

```css
background-color: #002747;
```

Nunca utilizar valores hexadecimais hardcoded.

### Cores para Background (Highlight)

| Tom | Token |
| --- | --- |
| Primary 130 | --dsc-color-bg-highlight-7 |
| Primary 110 | --dsc-color-bg-highlight-6 |
| Primary 90 | --dsc-color-bg-highlight-5 |
| Primary 70 | --dsc-color-bg-highlight-4 |
| Primary 50 | --dsc-color-bg-highlight-3 |
| Primary 30 | --dsc-color-bg-highlight-2 |
| Primary 10 | --dsc-color-bg-highlight-1 |

### Cores para Content (Texto - Highlight)

| Tom | Token |
| --- | --- |
| Primary 110 | --dsc-color-content-highlight-2 |
| Primary 90 | --dsc-color-content-highlight-1 |

### Cores para Border (Highlight)

| Tom | Token |
| --- | --- |
| Primary 90 | --dsc-color-border-highlight-1 |

### Cores Flexiveis - Ceu (uso restrito)

| Tom | Token |
| --- | --- |
| Ceu 130 | --dsc-color-ceu-130 |
| Ceu 110 | --dsc-color-ceu-110 |
| Ceu 90 | --dsc-color-ceu-90 |
| Ceu 70 | --dsc-color-ceu-70 |
| Ceu 50 | --dsc-color-ceu-50 |
| Ceu 30 | --dsc-color-ceu-30 |
| Ceu 10 | --dsc-color-ceu-10 |

---

## Gradientes Oficiais

- --dsc-color-gradient-gelo: Neutral 0 -> Neutral 50
- --dsc-color-gradient-oceano: Primary 90 -> Tertiary 70

Nao criar gradientes customizados fora do DSC.

---

## Diretrizes Unicas para o Agente

Sempre:

- Utilizar sidsc-components
- Utilizar tokens de cor
- Garantir acessibilidade
- Manter identidade visual CAIXA
- Gerar codigo Angular 19+ Standalone

Nunca:

- Hardcode de cores
- Alterar estilos internos dos componentes
- Criar UI paralela ao Design System
- Usar bibliotecas de UI conflitantes

---

## Versionamento

Design System utilizado: SIDSC Angular v19.1.4

---

## Fonte: guard-autenticacao.md

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

---

## Fonte: heuristicas-codigo.md

# Heurísticas de Código

## Condicionais em TypeScript

- Use switch quando comparar a mesma variável com vários valores fixos
- Use if/else para expressões lógicas, intervalos e condições compostas
- Priorize legibilidade: muitos caminhos fixos tendem a ficar melhores com switch

## Manipulação de Arrays (reduce)

- Prefira reduce() quando o objetivo for produzir valor derivado de um array
- Mantém estilo imutável e evita mutação do array original
- É indicado em services, selectors NgRx e transformações de dados

Exemplos:

- Soma de saldo:
  - transacoes.reduce((acc, t) => acc + t.valor, 0)
- Agrupamento por tipo:
  - transacoes.reduce((acc, t) => ({ ...acc, [t.tipo]: [...(acc[t.tipo] ?? []), t] }), {})

Boa prática:

- Combine map() e filter() antes do reduce() quando isso melhorar a leitura

---

## Fonte: clean-code-architecture-design-patterns.md

# Clean Code, Architecture e Design Patterns

## Objetivo

Estas regras sao obrigatorias para sugestoes de codigo e revisao de PRs.
O foco e manter legibilidade, coesao, baixo acoplamento e evolucao segura do sistema.

## Checklist Obrigatorio

- Funcoes com responsabilidade unica e tamanho reduzido
- Nomes claros e orientados ao dominio (sem abreviacoes opacas)
- Evitar duplicacao (DRY) sem criar abstracao prematura
- Classes e modulos com alta coesao
- Dependencias apontando para dentro da regra de negocio
- Regras de negocio isoladas de framework/UI/infra
- Tratamento de erro explicito e mensagens acionaveis
- Testes cobrindo regra critica e fluxo de falha

## Clean Code

- Nomes: explicitos e consistentes com o dominio
- Funcoes: pequenas, com poucos parametros e retorno tipado
- Comentarios: apenas quando a intencao nao for obvia pelo codigo
- Fluxo: evitar aninhamento profundo; preferir guard clauses
- Estado: evitar mutacao desnecessaria; preferir imutabilidade
- Excecoes: nao engolir erro silenciosamente

Sinais de alerta:

- Metodos enormes com multiplas responsabilidades
- Uso recorrente de any, cast excessivo ou supressao de erro de tipo
- Condicionais longas com regras de negocio misturadas com efeito colateral

## Architecture (Clean/Hexagonal orientativa)

- Camadas recomendadas:
  - Presentation: componentes, rotas e adaptadores de UI
  - Application: casos de uso/orquestracao
  - Domain: entidades, regras e contratos
  - Infrastructure: http, persistencia, gateways externos

Regras:

- Domain nao depende de Angular, HTTP, banco ou detalhes de infra
- Use cases nao conhecem detalhes de framework
- Infra implementa contratos definidos em camadas internas
- Evitar import cruzado entre features sem contrato explicito

## SOLID Aplicado

- S: cada classe/modulo com um unico motivo para mudar
- O: extensao por composicao/estrategia, nao por if em cascata
- L: substituicao sem quebrar comportamento esperado
- I: interfaces pequenas e especificas por consumidor
- D: depender de abstracoes, nao de implementacoes concretas

## Design Patterns Recomendados

- Strategy: variar regra de negocio sem if/switch em cascata
- Factory: centralizar criacao de objetos complexos
- Adapter: integrar SDK/API externa sem vazar detalhes
- Observer: eventos de dominio e reacao desacoplada
- Repository: abstrair acesso a dados quando houver regra de negocio

Quando evitar:

- Nao aplicar pattern sem dor real de manutencao
- Nao criar hierarquia excessiva para casos triviais

## Facade (Obrigatorio em features NgRx)

### Conceito

O Facade e um servico intermediario que encapsula a complexidade do NgRx
(Store, Actions, Selectors) expondo uma API simples e orientada ao dominio
para os componentes.

O componente nao conhece Store, dispatch nem selectors.
Ele fala apenas com o Facade.

### Quando usar

- Toda feature que utiliza NgRx deve ter um Facade
- Quando o componente precisaria chamar store.dispatch() diretamente
- Quando o componente precisaria injetar Store ou Selectors diretamente
- Quando multiplos componentes acessam o mesmo slice de estado

### Estrutura por feature

```text
states/feature-x/
  feature-x.actions.ts
  feature-x.reducer.ts
  feature-x.effects.ts
  feature-x.selectors.ts
  feature-x.state.ts
  feature-x.facade.ts   <- Facade da feature
```

### Regras obrigatorias

- Facade e um `@Injectable({ providedIn: 'root' })` ou scoped na feature
- Facade injeta Store via `inject(Store)`
- Facade expoe Observables/Signals de leitura (selectors)
- Facade expoe metodos de escrita (dispatch de actions)
- Componente injeta somente o Facade, nunca a Store diretamente
- Facade nao contem regra de negocio; delega para Effects e Services

### Exemplo

```ts
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ProdutosActions } from './produtos.actions';
import { selectProdutos, selectProdutosLoading, selectProdutosError } from './produtos.selectors';

@Injectable({ providedIn: 'root' })
export class ProdutosFacade {
  private store = inject(Store);

  // Leitura
  readonly produtos$ = this.store.select(selectProdutos);
  readonly loading$ = this.store.select(selectProdutosLoading);
  readonly error$   = this.store.select(selectProdutosError);

  // Escrita
  carregar(categoria: string): void {
    this.store.dispatch(ProdutosActions.carregar({ categoria }));
  }

  limpar(): void {
    this.store.dispatch(ProdutosActions.limpar());
  }
}
```

Uso no componente:

```ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProdutosFacade } from '../states/produtos/produtos.facade';

@Component({ /* ... */ })
export class ProdutosComponent {
  private facade = inject(ProdutosFacade);

  readonly produtos  = toSignal(this.facade.produtos$,  { initialValue: [] });
  readonly loading   = toSignal(this.facade.loading$,   { initialValue: false });
  readonly error     = toSignal(this.facade.error$,     { initialValue: null });

  carregar(categoria: string): void {
    this.facade.carregar(categoria);
  }
}
```

### Criterios de revisao

PASS:

- Componente injeta apenas o Facade
- Facade expoe API clara e orientada ao dominio
- Store, dispatch e selectors ficam encapsulados no Facade

FAIL:

- Componente injeta `Store` diretamente
- Componente chama `store.dispatch()` ou `store.select()` diretamente
- Facade contem regra de negocio ou logica de transformacao complexa

## Criterios de Revisao (PASS/FAIL)

PASS:

- Responsabilidades claras por modulo
- Dependencias e fronteiras de camada respeitadas
- Pattern aplicado com ganho real de legibilidade/evolucao

FAIL:

- Regra de negocio em componente/UI ou em camada de infra
- Acoplamento direto com detalhes externos sem abstracao
- Complexidade ciclomatica elevada sem justificativa

## Resultado Esperado

- Codigo facil de ler, testar e evoluir
- Menor regressao em mudancas de requisito
- Arquitetura previsivel e consistente entre features

## Feature — Unidade de Dominio

### Conceito

Feature e a unidade coesa de dominio do projeto. Agrupa tudo que pertence a um
mesmo contexto de negocio: componente, estado NgRx, Facade e rota.

### Regras obrigatorias

- Cada feature tem uma pasta propria em `states/nome-feature/`
- A pasta da feature contem obrigatoriamente: actions, reducer, effects, selectors, state e facade
- O nome da feature e o prefixo de todos os arquivos da pasta
- Componentes da feature ficam em `components/nome-feature/`
- Nenhuma feature importa diretamente o estado interno de outra feature
- Comunicacao entre features ocorre via `shared/` ou eventos de dominio

### Criterios de revisao (PASS/FAIL)

PASS:

- Cada pasta em `states/` tem os 6 arquivos obrigatorios incluindo o Facade
- Componentes da feature usam apenas o Facade da propria feature
- Rota da feature usa lazy loading com `loadComponent`
- Nomenclatura de arquivos consistente com o nome da feature

FAIL:

- Pasta em `states/` sem `*.facade.ts`
- Componente acessando estado de outra feature diretamente
- Feature sem slice de estado isolado (mistura de estados)
- Arquivos da feature sem nomenclatura padrao

---

## Fonte: offline-pwa.md

# Offline PWA

## Objetivo

Garantir uso do app sem internet, com enfileiramento e sincronização automática ao reconectar.

## Componentes Obrigatórios

- OfflineService para gerenciar:
  - status de conexão (isOnline$, isOffline$)
  - fila de sincronização (syncQueue$)
  - último horário de sincronização (lastSyncTime$)
- OfflineSyncInterceptor para:
  - capturar falhas de rede/offline
  - enfileirar requisições para reprocessamento
- OfflineAlertComponent para:
  - exibir estado offline ao usuário
  - mostrar quantidade de ações pendentes

## Regras de Persistência

- Persistir fila offline em localStorage
- Chave padrão: offline_sync_queue
- Persistência deve sobreviver a refresh e fechamento do app

## Regras de Integração no App

- Registrar OfflineSyncInterceptor na cadeia de interceptors HTTP
- Disponibilizar OfflineService globalmente via configuração da aplicação
- Incluir OfflineAlertComponent no layout raiz

## Regras de Sincronização

- Ao ficar offline, requisições de escrita devem ser enfileiradas
- Ao voltar online, processar fila automaticamente
- Ao sincronizar, atualizar lastSyncTime$
- Em erros de rede (status 0), tratar como cenário de offline

## Regras de UX Offline

- Informar claramente quando o app estiver sem conexão
- Exibir quantidade de itens pendentes de sincronização
- Não perder ações do usuário; priorizar confirmação local + sincronização posterior

## Configuração PWA Mínima

- Service Worker ativo via provideServiceWorker
- Manifesto em public/manifest.webmanifest
- Página offline opcional em src/offline.html

## Testes Obrigatórios de Cenário Offline

- Simular offline no navegador (DevTools > Network > Offline)
- Validar exibição do alerta offline
- Validar enqueue de ações sem rede
- Validar sincronização automática ao voltar online

## Padrões Proibidos no Fluxo Offline

- Não descartar silenciosamente erro de rede
- Não perder dados de ações do usuário quando offline
- Não depender somente de memória em runtime para fila de sync

---

## Fonte: performance.md

# Performance

## Lista e Renderização

- Em listas, usar referência estável por id
- Em templates, preferir @for (...; track item.id)
- Em virtual scroll, usar cdkVirtualFor com trackBy por id
- Nunca usar track por índice ($index) em listas dinâmicas
- Aplicar ChangeDetectionStrategy.OnPush em componentes de item e lista, quando aplicável

## GraphQL e Rede

- Buscar apenas campos necessários para a tela
- Em listagens, preferir payload mínimo (ex.: id, cliente, valor, status)
- Para leitura com reaproveitamento, preferir fetchPolicy: cache-first
- Evitar fetchPolicy: no-cache como padrão de navegação

## Estado e Alocação

- Evitar recriação desnecessária de arrays/objetos
- Ao atualizar coleção já transformada, evitar cópia redundante
- Preferir this.solicitacoes.set(viewModel)
- Evitar this.solicitacoes.set([...viewModel]) sem necessidade

## Virtual Scroll

- Em alto volume, usar @angular/cdk/scrolling
- Renderizar somente itens visíveis no viewport
- Definir itemSize coerente e viewport com altura explícita

## Medição Obrigatória

- Validar build de produção com source maps
- Analisar tamanho de bundle e duplicações

Comandos:

```bash
ng build --configuration production --source-map
npx source-map-explorer dist/**/*.js
```

## Meta de Resultado

- Menos chamadas desnecessárias de API
- Menor payload de rede
- Menos re-render e menos trabalho de GC
- Melhor fluidez em listas grandes

