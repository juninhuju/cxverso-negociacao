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
