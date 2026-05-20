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
