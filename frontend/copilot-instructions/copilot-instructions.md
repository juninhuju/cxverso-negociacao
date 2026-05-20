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
