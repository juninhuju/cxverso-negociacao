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
