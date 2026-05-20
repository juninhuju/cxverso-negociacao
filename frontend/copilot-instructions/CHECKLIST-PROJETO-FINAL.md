# ✅ Checklist de Projeto Final — Painel de Crédito (Referência: firebase/painel-credito)

> **Base de referência**: `firebase/painel-credito`
> Este checklist é aplicado ao final de qualquer projeto para garantir conformidade com o projeto modelo do curso.

---

## 📁 1. Estrutura de Pastas

- [ ] `src/app/core/` existe e contém serviços singleton (auth, preferences, tokens)
- [ ] `src/app/features/` existe e cada feature tem sua própria pasta
- [ ] Cada feature contém: `components/`, `models/`, `services/`
- [ ] `src/app/shared/components/` para componentes reutilizáveis (ex: header)
- [ ] `src/app/pipes/` para pipes customizados (ex: `cpf-mask.pipe.ts`)
- [ ] `src/app/services/` para facades globais (ex: `solicitacoes.facade.ts`)
- [ ] `src/environments/environments.ts` presente e configurado
- [ ] `src/assets/i18n/` com pelo menos `pt-BR.json`

---

## ⚙️ 2. Configuração Angular

- [ ] `app.config.ts` com todos os providers (sem `AppModule`)
- [ ] `app.routes.ts` centralizando todas as rotas
- [ ] Rotas com lazy loading via `loadComponent`
- [ ] Locale `pt-BR` configurado em `app.config.ts`
- [ ] `provideRouter()` com as rotas definidas
- [ ] `provideHttpClient()` com interceptores
- [ ] `provideServiceWorker()` configurado para produção
- [ ] `ngsw-config.json` presente com estratégias de cache
- [ ] `tsconfig.json` com `strict: true`, `target: ES2022`
- [ ] `.prettierrc` configurado (`singleQuote: true`, `printWidth: 100`)
- [ ] `.husky` + `lint-staged` configurados para pre-commit

---

## 🔥 3. Firebase / Backend

- [ ] `@angular/fire` instalado e configurado
- [ ] `firebaseConfig` presente em `environments.ts` (nunca hardcoded em componentes)
- [ ] `initializeApp()` e `provideFirestore()` em `app.config.ts`
- [ ] `provideAuth()` configurado
- [ ] `firebase.json` com `hosting` apontando para `dist/painel-credito/browser`
- [ ] Rewrite SPA configurado em `firebase.json` (`"**" → "/index.html"`)
- [ ] Coleções do Firestore documentadas (`solicitacoes`, `atividades`)

---

## 🔐 4. Autenticação e Segurança

- [ ] `authGuard` implementado como `CanActivateFn` usando `inject()`
- [ ] Guard redireciona para `/login` quando não autenticado
- [ ] Guard retorna `UrlTree` (declarativo), não navegação imperativa
- [ ] `authInterceptor` injetando Bearer token em requisições HTTP
- [ ] Login com e-mail/senha implementado
- [ ] Login com Google OAuth implementado
- [ ] Logout implementado e testado
- [ ] Rotas protegidas listadas com `canActivate: [authGuard]`
- [ ] Rota `/login` é pública (sem guard)
- [ ] `getToken()` no `AuthService` para recuperar token

---

## 📡 5. Serviços e Estado (Signals)

- [ ] Estado gerenciado com `signal()` nos services (sem NgRx neste projeto)
- [ ] `computed()` usado para dados derivados (filtros, resumos)
- [ ] `effect()` usado apenas para efeitos colaterais (não para regra de negócio)
- [ ] **Facade pattern** implementado para features complexas
- [ ] Facade expõe `computed()` signals de leitura e métodos de escrita
- [ ] Componentes injetam apenas o Facade — nunca o service diretamente
- [ ] `AuthService` com signals: `usuario`, `carregando`, `erro`, `isAuthenticated`
- [ ] `PreferencesService` com signals: `preferences` (theme, language)
- [ ] Persistência de preferências no `localStorage`

---

## 🧩 6. Componentes

- [ ] Todos os componentes são **standalone** (`standalone: true`)
- [ ] Nenhum `NgModule` criado
- [ ] DI feita exclusivamente com `inject()` (nunca `constructor` para DI)
- [ ] `input()` usado no lugar de `@Input()`
- [ ] `output()` usado no lugar de `@Output()` + `EventEmitter`
- [ ] `viewChild()` / `viewChildren()` no lugar de `@ViewChild()` / `@ViewChildren()`
- [ ] `host` no metadata no lugar de `@HostBinding()` / `@HostListener()`
- [ ] Componentes de lista usam `ChangeDetectionStrategy.OnPush`
- [ ] `trackBy` implementado em listas com `@for` ou `trackBy` function
- [ ] Nenhum `subscribe()` manual em componentes (usar `toSignal()` ou `async` pipe)
- [ ] Template usa controle de fluxo moderno: `@if`, `@for`, `@switch`
- [ ] **Sem** `*ngIf`, `*ngFor`, `*ngSwitch` nos templates

---

## 🗺️ 7. Roteamento

- [ ] Rota padrão `/` redireciona para `/login`
- [ ] Rota `/login` sem guard (pública)
- [ ] Rota `/solicitacoes` com `canActivate: [authGuard]`
- [ ] Rotas de detalhe com parâmetro (`/solicitacoes/:id`)
- [ ] Rotas de edição (`/solicitacoes/editar/:id`)
- [ ] Rota de perfil (`/perfil`)
- [ ] Rota de atividades (`/atividades`)
- [ ] Rota de simulador (`/simulador`)
- [ ] Todas as rotas lazy-loaded com `loadComponent`

---

## 🌍 8. Internacionalização (i18n)

- [ ] `@ngx-translate/core` instalado e configurado
- [ ] `provideTranslateService()` com `TranslateHttpLoader` em `app.config.ts`
- [ ] Fallback language `pt-BR` configurado
- [ ] Arquivo `src/assets/i18n/pt-BR.json` presente
- [ ] Templates usam pipe `translate`: `{{ 'CHAVE' | translate }}`
- [ ] Strings com parâmetros usando interpolação: `{ email: usuario.email }`
- [ ] `PreferencesService` permite troca de idioma em tempo de execução

---

## 🎨 9. Estilos e Temas

- [ ] `styles.scss` com variáveis CSS globais (`--page-bg`, `--card-bg`, `--text-main`, etc.)
- [ ] Tema claro e escuro implementados via CSS custom properties
- [ ] Font Inter carregada via Google Fonts
- [ ] Cada componente tem seu próprio `.scss` (não estilos inline)
- [ ] BEM naming convention nos seletores CSS
- [ ] Sem cores hexadecimais hardcoded fora das variáveis CSS
- [ ] Responsividade implementada (mobile-first ou breakpoints definidos)
- [ ] Tema aplicado via classe no `<body>` (`dark`, `light`)

---

## 📱 10. PWA (Progressive Web App)

- [ ] `@angular/service-worker` instalado
- [ ] `ngsw-config.json` configurado com grupos de assets e dados
- [ ] `public/manifest.webmanifest` com `name`, `short_name`, `theme_color`, `display: standalone`
- [ ] Ícones PWA em múltiplos tamanhos (72, 96, 128, 192, 384px)
- [ ] `provideServiceWorker()` com `registrationStrategy: 'registerWhenStable:30000'`
- [ ] Banner de offline implementado no `HeaderComponent`
- [ ] Eventos `online`/`offline` tratados no header
- [ ] App funciona offline para conteúdo em cache

---

## 📋 11. Auditoria de Atividades

- [ ] `AtividadesService` registra ações do usuário no Firestore
- [ ] Auditoria cobre: login, logout, criação, edição, exclusão, aprovação, recusa
- [ ] Cada atividade registra: tipo, descrição, email, nome, foto, data
- [ ] `atividades` collection separada no Firestore
- [ ] Componente de listagem de atividades implementado

---

## 🧮 12. Funcionalidades de Negócio

- [ ] CRUD completo de solicitações de crédito
- [ ] Status flow: `pendente` → `em_analise` → `aprovado` | `recusado`
- [ ] Filtro por status implementado
- [ ] Busca por nome/CPF implementada
- [ ] Resumo estatístico (total, pendentes, aprovadas, recusadas)
- [ ] Simulador de crédito com cálculo de parcela, total pago e juros
- [ ] Máscara de CPF (`xxx.xxx.xxx-xx`) via `ngx-mask` ou `CpfMaskPipe`
- [ ] Validação de formulário (nome obrigatório, CPF 11 dígitos)
- [ ] Perfil do usuário com foto, email, último acesso

---

## 🏗️ 13. Modelos e Tipagem

- [ ] `type StatusSolicitacao = 'pendente' | 'em_analise' | 'aprovado' | 'recusado'`
- [ ] `interface Solicitacao` com todos os campos tipados
- [ ] `interface SolicitacaoViewModel extends Solicitacao` com `statusLabel`, `statusClass`
- [ ] Sem uso de `any` em todo o código
- [ ] Todos parâmetros e retornos de funções tipados
- [ ] Interfaces e tipos em `models/` separados da lógica

---

## ♿ 14. Acessibilidade

- [ ] Atributos `aria-label` em botões de ação (editar, excluir, analisar)
- [ ] Navegação por teclado funcional
- [ ] Contraste de cores adequado (WCAG AA mínimo)
- [ ] Imagens com `alt` descritivo
- [ ] Formulários com `label` associados aos inputs
- [ ] Mensagens de erro acessíveis (`role="alert"` ou `aria-live`)
- [ ] Ícones decorativos com `aria-hidden="true"`

---

## ⚡ 15. Performance

- [ ] `ChangeDetectionStrategy.OnPush` em componentes de lista/card
- [ ] `trackBy` function em todos os `@for` que renderizam listas
- [ ] Rotas lazy-loaded (sem `eager` desnecessário)
- [ ] Imagens e assets otimizados
- [ ] Bundle initial < 500KB (alerta Angular)
- [ ] Service Worker cacheando assets estáticos
- [ ] `computed()` signals para evitar recalculações desnecessárias

---

## 🧪 16. Testes

- [ ] Testes unitários presentes para serviços críticos
- [ ] Testes do `authGuard` (com token e sem token)
- [ ] `ng test` roda sem erros
- [ ] Cobertura mínima de 80% nos serviços de negócio
- [ ] Testes não usam `any` nem suprimem erros de tipo

---

## 🚀 17. Build e Deploy

- [ ] `npm run build` (produção) executa sem erros
- [ ] Bundle gerado em `dist/painel-credito/browser`
- [ ] `npm run lint` sem erros
- [ ] `npm test` sem erros
- [ ] `npm audit` sem vulnerabilidades críticas
- [ ] Firebase Hosting configurado e deploy testado
- [ ] Variáveis de ambiente separadas por ambiente (`environments.ts`)

---

## 📝 18. Qualidade de Código

- [ ] Prettier aplicado (sem formatação inconsistente)
- [ ] ESLint sem erros ou warnings não intencionais
- [ ] Husky configurado para rodar lint no pre-commit
- [ ] Commits seguem Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- [ ] Sem `console.log` esquecido em produção
- [ ] Sem código comentado desnecessariamente
- [ ] README atualizado com instruções de setup e execução

---

## 🔁 19. Script de Auditoria Automática

Execute o script da pasta `copilot-instructions/` para verificação automatizada:

```powershell
# Auditar código-fonte do projeto
.\scripts\copilot-instructions.ps1 -Command audit -ProjectPath "C:\Desenvolvimento\Imersao\Thamiris\firebase\painel-credito"

# Verificar conformidade das instruções do Copilot
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Desenvolvimento\Imersao\Thamiris\firebase\painel-credito"

# Gate completo pré-entrega
.\scripts\copilot-instructions.ps1 -Command preflight -ProjectPath "C:\Desenvolvimento\Imersao\Thamiris\firebase\painel-credito"
```

---

## 📊 Resumo de Conformidade

| Área | Itens | Status |
|------|-------|--------|
| Estrutura de Pastas | 8 itens | ⬜ |
| Configuração Angular | 12 itens | ⬜ |
| Firebase | 7 itens | ⬜ |
| Autenticação/Segurança | 10 itens | ⬜ |
| Serviços e Estado | 9 itens | ⬜ |
| Componentes | 14 itens | ⬜ |
| Roteamento | 10 itens | ⬜ |
| i18n | 7 itens | ⬜ |
| Estilos/Temas | 8 itens | ⬜ |
| PWA | 8 itens | ⬜ |
| Auditoria de Atividades | 5 itens | ⬜ |
| Funcionalidades de Negócio | 10 itens | ⬜ |
| Modelos e Tipagem | 6 itens | ⬜ |
| Acessibilidade | 7 itens | ⬜ |
| Performance | 7 itens | ⬜ |
| Testes | 5 itens | ⬜ |
| Build/Deploy | 7 itens | ⬜ |
| Qualidade de Código | 8 itens | ⬜ |

**Total: ~148 itens verificáveis**
