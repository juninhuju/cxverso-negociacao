# Guia de Implementacao - Instrucoes Copilot Reutilizaveis

Este repositorio funciona como fonte central das suas instrucoes.

O script principal unificado e:

- scripts/copilot-instructions.ps1

O script abaixo gera (ou atualiza) o arquivo que o Copilot reconhece no projeto de destino:

- .github/copilot-instructions.md

## 1) Publicar em um projeto

No PowerShell, execute a partir desta pasta:

```powershell
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

## 2) Publicar em varios projetos

```powershell
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Dev\app-1","C:\Dev\app-2","C:\Dev\app-3"
```

## 2.1) Comando unico por pasta raiz (lote automatico)

Se seus projetos estao dentro de uma mesma pasta raiz, use:

```powershell
.\scripts\copilot-instructions.ps1 -Command publish-batch -ProjectsRootPath "C:\Desenvolvimento"
```

Opcionalmente:

```powershell
# varre subpastas recursivamente e copia os fontes separados
.\scripts\copilot-instructions.ps1 -Command publish-batch -ProjectsRootPath "C:\Desenvolvimento" -Recurse -CopySourceFiles

# publica apenas em repositorios Git
.\scripts\copilot-instructions.ps1 -Command publish-batch -ProjectsRootPath "C:\Desenvolvimento" -RequireGit
```

Observacoes do lote:

- O script identifica projetos por marcadores como package.json, angular.json, pom.xml ou *.sln
- A pasta desta biblioteca de instrucoes e ignorada automaticamente
- Para cada projeto encontrado, ele gera .github/copilot-instructions.md

## 3) Copiar tambem os arquivos fonte (opcional)

Se quiser manter os arquivos separados dentro do projeto para consulta humana:

```powershell
.\scripts\copilot-instructions.ps1 -Command publish -ProjectPath "C:\Desenvolvimento\meu-projeto" -CopySourceFiles
```

Isso cria:

- .github/copilot-instructions.md
- .github/copilot-instructions-sources/*.md

Arquivos fonte atualmente publicados:

- copilot-instructions.md
- copilot-instructions-dsc.md
- guard-autenticacao.md
- heuristicas-codigo.md
- clean-code-architecture-design-patterns.md
- offline-pwa.md
- performance.md

## 4) Quando rodar

Rode o script sempre que voce alterar qualquer arquivo desta pasta de instrucoes.

## 5) Fluxo recomendado

1. Atualize os arquivos nesta pasta central.
2. Rode o script para cada projeto alvo.
3. Commit no projeto alvo para versionar a versao das instrucoes.

## 6) Validacao rapida

No projeto alvo, confirme se o arquivo existe:

- .github/copilot-instructions.md

Se o arquivo existir, o Copilot ja consegue consumir as instrucoes no repositorio.

## 7) Verificar se o projeto atende aos parametros

Para auditar conformidade de um projeto:

```powershell
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

Para auditar varios projetos:

```powershell
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Dev\app-1","C:\Dev\app-2"
```

Para exigir tambem a validacao dos arquivos fonte copiados no projeto:

```powershell
.\scripts\copilot-instructions.ps1 -Command verify -ProjectPath "C:\Desenvolvimento\meu-projeto" -RequireSourceFiles
```

Para publicar e verificar em sequencia (comando unico):

```powershell
$projeto = "C:\Desenvolvimento\meu-projeto"; .\scripts\copilot-instructions.ps1 -Command publish -ProjectPath $projeto; if ($?) { .\scripts\copilot-instructions.ps1 -Command verify -ProjectPath $projeto } else { exit 1 }
```

Se estiver executando a partir do Git Bash, use aspas simples no bloco do `-Command` para evitar expansao indevida de variaveis:

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '$projeto = "C:\Desenvolvimento\meu-projeto"; .\scripts\copilot-instructions.ps1 -Command publish -ProjectPath $projeto; if ($?) { .\scripts\copilot-instructions.ps1 -Command verify -ProjectPath $projeto } else { exit 1 }'
```

Como interpretar o resultado:

- [PASS] indica conformidade
- [FAIL] indica divergencia e sugere a acao corretiva
- Exit code 0: tudo ok
- Exit code 1: houve falha

Relatorio automatico da verificacao:

- A cada execucao de `verify`, o script gera/atualiza `docs/relatorioCopilot.md` no projeto analisado
- O relatorio lista cada arquivo analisado com status `Pass` ou `noPass`
- Quando houver `noPass`, o relatorio informa as linhas de codigo divergentes (quando aplicavel)

## 8) Auditar conformidade do codigo-fonte do projeto

O comando `audit` analisa os arquivos `.ts`, `.html`, `.scss` e `.css` do projeto e verifica
se o codigo real viola as regras das instrucoes (padroes proibidos, decoradores legados, etc.).

Para auditar o codigo-fonte de um projeto:

```powershell
.\scripts\copilot-instructions.ps1 -Command audit -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

Para auditar varios projetos:

```powershell
.\scripts\copilot-instructions.ps1 -Command audit -ProjectPath "C:\Dev\app-1","C:\Dev\app-2"
```

O que e auditado:

| Regra   | O que detecta |
| ------- | ------------- |
| TS001   | Uso de `any` |
| TS002   | `@Input()` proibido (usar `input()`) |
| TS003   | `@Output()` proibido (usar `output()`) |
| TS004   | `@ViewChild()` proibido (usar `viewChild()`) |
| TS005   | `@ViewChildren()` proibido (usar `viewChildren()`) |
| TS006   | `@ContentChild()` proibido (usar `contentChild()`) |
| TS007   | `@ContentChildren()` proibido (usar `contentChildren()`) |
| TS008   | `@HostBinding()` proibido (usar `host` no metadata) |
| TS009   | `@HostListener()` proibido (usar `host` no metadata) |
| TS010   | DI via `constructor` proibido (usar `inject()`) |
| TS011   | `subscribe()` manual em componentes |
| TS012   | `EventEmitter` proibido (usar `output()`) |
| TS013   | `NgModule` proibido (usar standalone) |
| TS014   | `AppRoutingModule` proibido (usar `app.routes.ts`) |
| HTML001 | `*ngIf` proibido (usar `@if`) |
| HTML002 | `*ngFor` proibido (usar `@for`) |
| HTML003 | `*ngSwitch` proibido (usar `@switch`) |
| HTML004 | `ng-template` para controle de fluxo proibido |
| CSS001  | Cor hexadecimal hardcoded proibida (usar tokens DSC) |
| TS015   | `inject(Store)` em componente (usar Facade) |
| TS016   | `store.dispatch()` direto em componente (usar Facade) |
| TS017   | `store.select()` direto em componente (usar Facade) |
| ARC001  | Pasta `states/` ausente ou feature sem arquivos obrigatorios |
| ARC002  | Feature sem `*.facade.ts` |

Relatorio gerado automaticamente:

- A cada execucao de `audit`, o script gera/atualiza `docs/relatorioAudit.md` no projeto analisado
- O relatorio lista cada arquivo com violacoes, a regra, a linha e o trecho do codigo
- Status geral: `Pass` ou `noPass`
- Exit code 0: sem violacoes
- Exit code 1: violacoes encontradas

## 9) Gate pre-envio (preflight)

O comando `preflight` executa um gate completo de qualidade antes da analise final:

- `verify` das instrucoes publicadas
- `audit` de conformidade do codigo
- `npm run lint` (quando existir script)
- `npm run test -- --watch=false --code-coverage` (quando existir script)
- Validacao de cobertura minima (quando houver `coverage/coverage-summary.json`)
- `npm run build -- --configuration production` (quando existir script)
- `npm audit --audit-level=high`

Comando:

```powershell
.\scripts\copilot-instructions.ps1 -Command preflight -ProjectPath "C:\Desenvolvimento\meu-projeto"
```

Relatorio gerado automaticamente:

- `docs/relatorioPreflight.md`
- Status por etapa (`Pass`, `noPass` ou `skip`)
- Nota preflight automatica

Interpretacao da nota:

- `>= 85`: pronto para revisao final frontend senior
- `70 a 84.9`: precisa ajustes antes da revisao final
- `< 70`: bloqueado para envio

## 10) Padrao oficial de execucao

Use somente o script unificado:

- scripts/copilot-instructions.ps1

Os wrappers antigos foram removidos para simplificar manutencao e evitar duplicidade de ponto de entrada.
