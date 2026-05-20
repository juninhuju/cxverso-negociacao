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
