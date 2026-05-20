# Checklist WCAG por Rota

Este checklist define o minimo obrigatorio de validacao de acessibilidade por rota.

## Como usar

- Validar manualmente em teclado (Tab, Shift+Tab, Enter, Espaco).
- Executar testes automatizados de acessibilidade: `npm run test:a11y`.
- Executar gate completo: `npm run validate:a11y`.

## Rota: /login

- Nome acessivel para todos os campos e botoes.
- Botao de mostrar/ocultar senha com `aria-label` dinamico e `aria-pressed`.
- Erro de autenticacao anunciado de forma textual.
- Ordem de foco sem salto e com foco visivel.
- Contraste minimo AA nos elementos principais.

## Rota: /renegociacao

- Titulos e secoes com hierarquia semantica clara.
- Botoes de avancar/voltar com nome acessivel explicito.
- Estados de carregamento, erro e sucesso anunciados com `role`/`aria-live` quando aplicavel.
- Tabelas e listas com contexto textual compreensivel para leitor de tela.
- Nao depender apenas de cor para indicar status.

## Rota: /acompanhamento

- Lista de contratos e solicitacoes navegavel por teclado.
- Acoes de item (detalhar/excluir/iniciar) com `aria-label` contextual.
- Estado vazio identificado com mensagem clara.
- Confirmacoes destrutivas com texto explicito e foco previsivel.

## Rota: /chatbot

- Lista de conversas com indicacao de item ativo (`aria-current` quando aplicavel).
- Campo de mensagem com rotulo acessivel.
- Mensagens novas com contexto suficiente para tecnologias assistivas.
- Botoes de enviar e criar conversa acionaveis por teclado.

## Criterios de aprovacao

- Zero violacoes graves (critical/serious) no `npm run test:a11y`.
- Zero erro de lint de acessibilidade em templates (`angular-eslint templateAccessibility`).
- Fluxos principais navegaveis so com teclado.
