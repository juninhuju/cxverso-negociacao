# Instrucoes de Uso — Repositorio de Instrucoes para Copilot

## COMO EXECUTAR O TESTE AGORA (VERIFY)

Execute este comando no PowerShell, a partir da pasta `copilot-instructions/`:

```powershell
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Desenvolvimento\projeto"
```

Saida esperada:

- `[PASS]` quando o projeto esta em conformidade
- `[FAIL]` quando ha divergencias e precisa republish

Relatorio gerado automaticamente em `docs/relatorioCopilot.md` no projeto analisado.

---

## O que e esta pasta

Esta pasta e uma biblioteca central de instrucoes para o GitHub Copilot.

Ela nao e um projeto Angular. Ela e a **fonte de verdade das regras** que o Copilot vai
seguir ao gerar codigo em qualquer projeto que voce vincular a ela.

Quando voce publica as instrucoes em um projeto, o Copilot passa a:

- Sugerir codigo Angular 19+ com Signals, NgRx 19 e TypeScript strict
- Usar `input()`, `output()`, `viewChild()` em vez dos decoradores legados
- Gerar templates com `@if`, `@for`, `@switch` em vez de `*ngIf`, `*ngFor`
- Respeitar a arquitetura de pastas obrigatoria (`components`, `guards`, `models`, etc.)
- Usar componentes e tokens de cor do Design System SIDSC/DSC da CAIXA
- Aplicar Clean Code, SOLID e Design Patterns no codigo sugerido
- Seguir regras de acessibilidade (WCAG, aria, foco, contraste)
- Adotar padroes de performance (OnPush, trackBy, virtual scroll, cache-first)
- Implementar fluxo offline com `OfflineService` e `OfflineSyncInterceptor`
- Proteger rotas com `authGuard` usando `CanActivateFn` + `inject()`

---

## Estrutura da pasta

```
copilot-instructions/
  instrucoes.md                              <- este arquivo
  GUIA-IMPLEMENTACAO.md                      <- referencia tecnica completa dos comandos
  copilot-instructions.md                    <- regras principais Angular 19 + NgRx 19
  copilot-instructions-dsc.md                <- regras do Design System SIDSC/DSC CAIXA
  guard-autenticacao.md                      <- regras de guard e autenticacao
  heuristicas-codigo.md                      <- switch/if, reduce, boas praticas
  clean-code-architecture-design-patterns.md <- Clean Code, SOLID, Design Patterns
  offline-pwa.md                             <- regras de PWA e sincronizacao offline
  performance.md                             <- regras de performance e renderizacao
  scripts/
              copilot-instructions.ps1                 <- script unificado (publish / verify / audit / preflight)
```

---

## Fluxo de uso em 3 passos

### Passo 1 — Publicar as instrucoes no projeto

Execute a partir desta pasta (PowerShell):

```powershell
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

Isso gera o arquivo `.github/copilot-instructions.md` no projeto de destino.
O Copilot detecta esse arquivo automaticamente e passa a seguir as regras nele contidas.

> Se quiser tambem copiar os arquivos-fonte separados para consulta humana:
>
> ```powershell
> .\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Desenvolvimento\meu-projeto" -CopySourceFiles
> ```
> Isso cria `.github/copilot-instructions-sources/*.md` no projeto.

---

### Passo 2 — Verificar se o arquivo de instrucoes esta atualizado

Sempre que voce alterar qualquer arquivo desta pasta, re-publique nos projetos.
Para confirmar que o arquivo publicado esta em conformidade com o fonte atual:

```powershell
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

Resultado:

- `[PASS]` — arquivo em conformidade
- `[FAIL]` — divergencia; republique com `publish`

Relatorio gerado automaticamente em `docs/relatorioCopilot.md` dentro do projeto analisado,
com status `Pass` ou `noPass` por arquivo e linhas divergentes quando aplicavel.

---

### Passo 3 — Auditar se o codigo do projeto segue as regras

Este e o passo mais valioso. Ele analisa os arquivos `.ts`, `.html`, `.scss` e `.css`
do projeto e detecta violacoes reais das regras definidas nas instrucoes:

```powershell
.\scripts\copilot-instructions.ps1 -Command audit -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

O que e verificado no codigo real do projeto:

| Regra   | O que detecta |
| ------- | ------------- |
| TS001   | Uso de `any` |
| TS002   | `@Input()` (usar `input()`) |
| TS003   | `@Output()` (usar `output()`) |
| TS004   | `@ViewChild()` (usar `viewChild()`) |
| TS005   | `@ViewChildren()` (usar `viewChildren()`) |
| TS006   | `@ContentChild()` (usar `contentChild()`) |
| TS007   | `@ContentChildren()` (usar `contentChildren()`) |
| TS008   | `@HostBinding()` (usar `host` no metadata) |
| TS009   | `@HostListener()` (usar `host` no metadata) |
| TS010   | DI via `constructor` (usar `inject()`) |
| TS011   | `subscribe()` manual em componentes |
| TS012   | `EventEmitter` (usar `output()`) |
| TS013   | `@NgModule` (usar standalone) |
| TS014   | `AppRoutingModule` (usar `app.routes.ts`) |
| HTML001 | `*ngIf` (usar `@if`) |
| HTML002 | `*ngFor` (usar `@for`) |
| HTML003 | `*ngSwitch` (usar `@switch`) |
| HTML004 | `<ng-template>` para controle de fluxo |
| CSS001  | Cores hex hardcoded (usar tokens DSC) |

Relatorio gerado automaticamente em `docs/relatorioAudit.md` dentro do projeto analisado,
com arquivo, regra, numero da linha e trecho do codigo para cada violacao encontrada.

---

## Comandos de referencia rapida

Todos os comandos devem ser executados a partir desta pasta (`copilot-instructions/`).

### Publicar em um projeto

```powershell
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

### Publicar em varios projetos de uma vez

```powershell
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Dev\app-1","C:\Dev\app-2","C:\Dev\app-3"
```

### Publicar em todos os projetos de uma pasta raiz

```powershell
.\scripts\copilot-instructions.ps1 -Command publish-batch -ProjectsRootPath "C:\Desenvolvimento"
```

### Verificar conformidade do arquivo de instrucoes

```powershell
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

### Auditar codigo-fonte do projeto

```powershell
.\scripts\copilot-instructions.ps1 -Command audit -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

### Rodar gate pre-envio completo (preflight)

```powershell
.\scripts\copilot-instructions.ps1 -Command preflight -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

O `preflight` executa um gate consolidado antes de enviar para testes e revisao frontend senior,
rodando em sequencia: `verify`, `audit`, `lint`, `test`, validacao de cobertura, `build` de producao
e `npm audit`.

Relatorio gerado automaticamente: `docs/relatorioPreflight.md`.

### Publicar e verificar em sequencia (um comando)

PowerShell:

```powershell
$p = "C:\Desenvolvimento\meu-projeto"
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath $p
if ($?) { .\scripts\copilot-instructions.ps1 -Command verify -ProjectPath $p }
```

Git Bash (aspas simples obrigatorias para proteger variaveis):

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '$p = "C:\Desenvolvimento\meu-projeto"; .\scripts\copilot-instructions.ps1 -Command publish -ProjectPath $p; if ($?) { .\scripts\copilot-instructions.ps1 -Command verify -ProjectPath $p } else { exit 1 }'
```

---

## Fluxo recomendado no dia a dia

```
1. Editar qualquer arquivo .md desta pasta
       |
       v
2. Publicar nos projetos afetados (publish)
       |
       v
3. Verificar conformidade do arquivo gerado (verify)
       |
       v
4. Commitar o .github/copilot-instructions.md no projeto alvo
       |
       v
5. Rodar auditoria de codigo (audit) para checar se o projeto
   ja adota as regras na pratica
       |
       v
6. Corrigir violacoes apontadas no docs/relatorioAudit.md
```

---

## Quando republica e necessario

Republique sempre que voce:

- Adicionar ou remover uma regra em qualquer arquivo `.md` desta pasta
- Criar um novo arquivo de regras (ex: novo topico de instrucoes)
- Quiser propagar uma correcao de formulacao para todos os projetos

---

## Informacoes importantes

### O Copilot le as instrucoes automaticamente

Basta o arquivo `.github/copilot-instructions.md` existir no projeto.
Nao e necessaria nenhuma configuracao adicional no VS Code ou no Copilot.

### As instrucoes sao compostas de varios arquivos-fonte

O arquivo publicado no projeto e a uniao de todos os arquivos desta pasta na seguinte ordem:

1. `copilot-instructions.md` — base Angular 19 + NgRx 19
2. `copilot-instructions-dsc.md` — Design System SIDSC/DSC CAIXA
3. `guard-autenticacao.md` — autenticacao e guards de rota
4. `heuristicas-codigo.md` — switch/if, reduce
5. `clean-code-architecture-design-patterns.md` — Clean Code, SOLID, patterns
6. `offline-pwa.md` — PWA e offline sync
7. `performance.md` — performance e renderizacao

### O audit nao substitui o lint

O `audit` verifica padroes proibidos por regex e e rapido. Ele nao substitui `ng lint`.
Use os dois: `audit` para conformidade com estas instrucoes, `ng lint` para regras do ESLint.

### Os relatorios ficam no projeto analisado

- `docs/relatorioCopilot.md` — gerado pelo `verify`
- `docs/relatorioAudit.md` — gerado pelo `audit`
- `docs/relatorioPreflight.md` — gerado pelo `preflight`

Ambos sao sobrescritos a cada execucao. Versione-os no Git se quiser historico.

### Este repositorio nao deve ser um projeto Angular

Nao adicione `package.json`, `angular.json` ou `node_modules` aqui.
Isso evita que o `publish-batch` tente publicar instrucoes dentro desta propria pasta.
