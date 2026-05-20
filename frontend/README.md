# NegociaCaixa

## Node.js (LTS)

Este projeto deve ser executado com Node.js LTS na faixa `>=20 <23` (recomendado Node 22).

- Arquivo de versao: `.nvmrc` (`22`)
- Restricao em `package.json`: `"engines": { "node": ">=20 <23" }`

Exemplo com nvm:

```bash
nvm install 22
nvm use 22
```

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.21.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Acessibilidade (WCAG 2.1)

Este projeto segue as diretrizes de acessibilidade da [WCAG 2.1 (nível AA)](https://www.w3.org/WAI/WCAG21/quickref/). Conformidade estimada: **85-90%**.

### Padrões Implementados

#### 1. **Controles com Nomes Acessíveis** (aria-label)
Todo controle interativo (botões, links, campos) possui um nome acessível explícito:

```html
<!-- ✅ Correto: botão com aria-label -->
<button aria-label="Sair do sistema" (click)="logout()">
  <mat-icon>logout</mat-icon>
</button>

<!-- ✅ Correto: botão toggle com estado dinâmico -->
<button [attr.aria-label]="isSidenavOpen() ? 'Fechar menu' : 'Abrir menu'">
  Menu
</button>
```

#### 2. **Ícones Decorativos Ocultos** (aria-hidden)
Ícones puramente decorativos são marcados como ocultos para leitores de tela:

```html
<!-- ✅ Correto: ícone decorativo -->
<mat-icon aria-hidden="true">handshake</mat-icon>
```

#### 3. **Papéis Semânticos** (role, aria-live)
Elementos com comportamento especial têm roles apropriados:

```html
<!-- ✅ Correto: status de carregamento anunciado -->
<div role="status" aria-live="polite">
  ✓ Operação concluída com sucesso
</div>

<!-- ✅ Correto: alerta para mensagens de erro -->
<p role="alert">{{ erroMsg }}</p>
```

#### 4. **Labels Acessíveis**
Campos de formulário têm labels explícitos:

```html
<!-- ✅ Correto: label visível -->
<label for="documento">CPF ou CNPJ</label>
<input id="documento" type="text" />

<!-- ✅ Correto: label oculto visualmente (sr-only) -->
<label class="sr-only" for="busca">Buscar contratos</label>
<input id="busca" placeholder="Digite um número..." />
```

#### 5. **Navegação por Teclado**
Todos os componentes são navegáveis via teclado:

```html
<!-- ✅ Correto: buttons com type e aria-label -->
<button type="button" aria-label="Ação">Botão</button>

<!-- ✅ Correto: inputs com label associado -->
<input type="text" id="nome" aria-label="Nome completo" />

<!-- ✅ Correto: links semânticos -->
<a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
```

#### 6. **HTML Semântico**
Elementos nativos preferidos sobre div genéricos:

```html
<!-- ✅ Correto: estrutura semântica -->
<header aria-label="Cabeçalho corporativo">
  <h1>Título Principal</h1>
</header>

<nav aria-label="Navegação principal">
  <a routerLink="/home">Home</a>
  <a routerLink="/contratos">Contratos</a>
</nav>

<main role="main">
  <section aria-label="Conteúdo principal">
    <!-- conteúdo -->
  </section>
</main>
```

### Validar Acessibilidade

#### 1. **Teste com Leitor de Tela**

**Windows - NVDA (gratuito)**
```bash
# Baixar em: https://www.nvaccess.org
# Executar ng serve e abrir em navegador
# Usar NVDA para navegar
```

**macOS / iOS - VoiceOver (nativo)**
```bash
# macOS: Cmd + F5
# iOS: Configurações > Acessibilidade > VoiceOver > Ativar
```

**Teste de navegação por teclado:**
- Pressionar `Tab` para navegar entre elementos
- Pressionar `Shift+Tab` para navegar para trás
- Pressionar `Enter` em botões e links
- Pressionar `Space` em checkboxes e toggles

#### 2. **Ferramentas de Validação Automática**

```bash
# Axe DevTools Chrome Extension
# https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnkpklempisson

# WAVE (Web Accessibility Evaluation Tool)
# https://wave.webaim.org

# Lighthouse (integrado no Chrome DevTools)
# DevTools > Lighthouse > Accessibility
```

#### 3. **Validação de Contraste**
O projeto usa tokens de cor do SIDSC Design System que garantem contraste WCAG AA:

```scss
// ✅ Correto: usar tokens de cor
color: var(--dsc-color-content-highlight-2);
background: var(--dsc-color-bg-highlight-6);

// ❌ Evitar: hardcode de cores
color: #002747;
background: #ffffff;
```

### Checklist de Acessibilidade para Novo Código

Antes de fazer commit, valide:

- [ ] Todos os botões / links têm `aria-label` ou texto visível
- [ ] Ícones decorativos têm `aria-hidden="true"`
- [ ] Campos de formulário têm `<label>` explícita com `for`
- [ ] Mensagens de status / erro têm `role="alert"` ou `aria-live`
- [ ] Estrutura semântica com `<header>`, `<nav>`, `<main>`, `<section>`
- [ ] Navegação por teclado funciona em todo o fluxo
- [ ] Contraste de cor segue SIDSC Design System
- [ ] Testes passam sem aviso de acessibilidade

### Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM - Accessibility Articles](https://webaim.org/articles/)
- [MDN - Acessibilidade Web](https://developer.mozilla.org/pt-BR/docs/Learn/Accessibility)

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# cxverso-negociacao
