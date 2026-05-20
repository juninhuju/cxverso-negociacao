# Plataforma de Renegociação — API (Negociação)

Esta API fornece endpoints para:

* **Listar clientes**
* **Buscar cliente por CPF**
* **Listar contratos de um cliente**
* **Buscar detalhes de um contrato**
* **Simular renegociação** (com entrada e número de parcelas)

## URL base

Todos os endpoints começam com:

```
/negociacao
```

Exemplo (local):

```
http://localhost:8080/negociacao
```

## Formato de dados

A API trabalha com JSON:

* Envia JSON: `Content-Type: application/json`
* Recebe JSON: `Accept: application/json`

\---

# 1\) Listar todos os clientes

## ✅ Endpoint

**GET** `/negociacao/clientes`

## O que faz?

Retorna uma lista com **id**, **nome** e **cpf** de todos os clientes cadastrados.

## Exemplo de requisição (cURL)

```bash
curl -X GET "http://localhost:8080/negociacao/clientes" \\
  -H "Accept: application/json"
```

## ✅ Resposta de sucesso — 200

```json
\[
  {
    "id": 1,
    "nome": "Maria da Silva",
    "cpf": "12345678901"
  },
  {
    "id": 2,
    "nome": "João Souza",
    "cpf": "98765432100"
  }
]
```

## Possíveis erros

* **400** (requisição inválida)
* **403** (acesso negado)
* **404** (recurso não encontrado)
* **503** (serviço indisponível)

> Em erros, o retorno é `application/problem+json` (um JSON com informações do problema).

Exemplo genérico (formato típico):

```json
{
  "title": "Requisição inválida",
  "status": 400,
  "detail": "Campo X está inválido",
  "instance": "/negociacao/clientes"
}
```

\---

# 2\) Buscar cliente pelo CPF

## ✅ Endpoint

**GET** `/negociacao/clientes/{cpf}`

* `{cpf}` deve ter **11 dígitos** (somente números)

## O que faz?

Busca um cliente específico pelo CPF.

## Exemplo

**GET** `/negociacao/clientes/12345678901`

### Requisição (cURL)

```bash
curl -X GET "http://localhost:8080/negociacao/clientes/12345678901" \\
  -H "Accept: application/json"
```

## ✅ Resposta de sucesso — 200

```json
{
  "id": 1,
  "nome": "Maria da Silva",
  "cpf": "12345678901"
}
```

## Possíveis erros

* **404** se o CPF não existir
* **400**, **403**, **503** conforme regras gerais

\---

# 3\) Listar contratos de um cliente

## ✅ Endpoint

**GET** `/negociacao/clientes/{clienteId}/contratos`

## O que faz?

Retorna a lista de contratos vinculados a um cliente.

* Se o cliente não tiver contratos, retorna **lista vazia** `\[]`.

## Exemplo

**GET** `/negociacao/clientes/1/contratos`

### Requisição (cURL)

```bash
curl -X GET "http://localhost:8080/negociacao/clientes/1/contratos" \\
  -H "Accept: application/json"
```

## ✅ Resposta de sucesso — 200

Retorna uma lista de `ContratoResumoDto`:

```json
\[
  {
    "id": 10,
    "tipoContrato": "Habitacional",
    "saldoDevedor": 25000.75,
    "statusDivida": "EM\_ATRASO"
  },
  {
    "id": 11,
    "tipoContrato": "Consignado",
    "saldoDevedor": 7800.00,
    "statusDivida": "REGULAR"
  }
]
```

## Possíveis erros

* **400** (formato inválido, por exemplo `clienteId` não numérico)
* **503** (serviço indisponível)

\---

# 4\) Buscar detalhes de um contrato

## ✅ Endpoint

**GET** `/negociacao/contratos/{contratoId}`

## O que faz?

Retorna **todos os dados** do contrato, incluindo:

* Dados principais do contrato
* Garantias (se existirem)
* Status
* Custas / honorários
* Campos **derivados de negociação** (ex.: desconto, CET etc.) — **podem vir `null`** dependendo do status

## Exemplo

**GET** `/negociacao/contratos/10`

### Requisição (cURL)

```bash
curl -X GET "http://localhost:8080/negociacao/contratos/10" \\
  -H "Accept: application/json"
```

## ✅ Resposta de sucesso — 200

> Repare que alguns campos podem ser `null` quando o status não permite exibir cálculos.

```json
{
  "id": 10,
  "clienteId": 1,
  "tipoContrato": "Habitacional",
  "saldoDevedor": 25000.75,

  "desconto": 0.15,
  "valorDesconto": 3750.11,
  "saldoRenegociado": 21250.64,
  "entradaNegociacao": 2125.06,
  "entradaTotal": 2500.06,
  "valorFinanciado": 19125.58,
  "parcelaMinima": 6,
  "parcelaMaxima": 48,
  "jurosAoMesTaxa": 0.0199,
  "iofTaxa": 0.0038,
  "cet": 0.0237,

  "possuiGarantia": true,
  "quantidadeGarantias": 1,
  "garantias": \[
    {
      "id": 5,
      "tipo": "IMOVEL",
      "descricao": "Apartamento Asa Norte"
    }
  ],
  "statusDivida": "EM\_ATRASO",
  "statusNegociacao": "EM\_NEGOCIACAO",
  "custasCartorarias": 120.00,
  "custas": 80.00,
  "honorarios": 175.00
}
```

### Exemplo quando os cálculos NÃO podem ser exibidos

```json
{
  "id": 10,
  "clienteId": 1,
  "tipoContrato": "Habitacional",
  "saldoDevedor": 25000.75,

  "desconto": null,
  "valorDesconto": null,
  "saldoRenegociado": null,
  "entradaNegociacao": null,
  "entradaTotal": null,
  "valorFinanciado": null,
  "parcelaMinima": null,
  "parcelaMaxima": null,
  "jurosAoMesTaxa": null,
  "iofTaxa": null,
  "cet": null,

  "possuiGarantia": false,
  "quantidadeGarantias": 0,
  "garantias": \[],
  "statusDivida": "REGULAR",
  "statusNegociacao": "FORMALIZADA",
  "custasCartorarias": 120.00,
  "custas": 80.00,
  "honorarios": 175.00
}
```

## Possíveis erros

* **404** (contrato não encontrado)
* **503** (serviço indisponível)

\---

# 5\) Simular renegociação de um contrato

## ✅ Endpoint

**POST** `/negociacao/contratos/{contratoId}/simulacao`

## O que faz?

Calcula e salva uma simulação de renegociação para um contrato, com base em:

* **Entrada**
* **Quantidade de parcelas**

O cálculo usa o sistema **PRICE** (parcelas com valor fixo).

## Exemplo

**POST** `/negociacao/contratos/10/simulacao`

### Exemplo de entrada (JSON)

> ⚠️ Campos abaixo são uma suposição baseada na descrição do endpoint.
> Se você enviar o `SimulacaoRequestDto`, eu ajusto com precisão.

```json
{
  "entrada": 2000.00,
  "quantidadeParcelas": 24
}
```

### Requisição (cURL)

```bash
curl -X POST "http://localhost:8080/negociacao/contratos/10/simulacao" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "entrada": 2000.00,
    "quantidadeParcelas": 24
  }'
```

## ✅ Resposta de sucesso — 200

Retorna `SimulacaoResponseDto`:

```json
{
  "simulacaoId": 100,
  "contratoId": 10,
  "saldoDevedor": 25000.75,
  "saldoRenegociado": 21250.64,
  "entradaNegociacao": 2000.00,
  "custasCartorarias": 120.00,
  "entradaTotal": 2375.00,
  "valorFinanciado": 19250.64,
  "quantidadeParcelas": 24,
  "valorParcela": 987.45,
  "jurosAoMesTaxa": 0.0199,
  "iofTaxa": 0.0038,
  "cet": 0.0237,
  "tabelaCalculo": "PRICE",
  "statusSimulacao": "CALCULADA"
}
```

## Possíveis erros

* **400**: entrada ou parcelas fora das regras
* **404**: contrato não encontrado
* **409**: contrato não está em fase de negociação
* **503**: serviço indisponível

\---

# Resumo rápido (para quem só quer copiar e chamar)

## Clientes

* `GET /negociacao/clientes`
* `GET /negociacao/clientes/{cpf}`

## Contratos

* `GET /negociacao/clientes/{clienteId}/contratos`
* `GET /negociacao/contratos/{contratoId}`

## Simulação

* `POST /negociacao/contratos/{contratoId}/simulacao`



# API de Negociação — Endpoints de Formalização e Consulta

Este README explica **de forma simples** (para quem não é de backend) como usar **os endpoints criados agora** para:

1. **Formalizar uma negociação** (criar uma negociação fechada)
2. **Consultar uma negociação** (buscar os detalhes de uma negociação já criada)

> \\\*\\\*Base path da API:\\\*\\\* todos os endpoints abaixo começam com ` /negociacao `.
>
> Exemplo: se sua aplicação estiver rodando em `http://localhost:8080`, então a URL completa será algo como:
>
> `http://localhost:8080/negociacao/...`

\---

## 1\) Formalizar negociação

### ✅ O que faz?

Cria uma nova negociação **formalizada** para um contrato e, ao mesmo tempo, atualiza o contrato para o status **`FORMALIZADA`**.

### 🔗 Endpoint

`POST /negociacao/negociacoes`

### 📥 Entrada (JSON)

Campos:

* `contratoId` (número): ID do contrato que será negociado
* `entradaNegociacao` (número): valor de entrada pago na negociação
* `quantidadeParcelas` (número): quantidade de parcelas desejada

#### Exemplo de request

```json
{
  "contratoId": 1001,
  "entradaNegociacao": 10000,
  "quantidadeParcelas": 24
}
```

### 📤 Saída (JSON)

Campos:

* `negociacaoId` (número): ID gerado da negociação
* `statusNegociacao` (texto): sempre `FORMALIZADA`
* `valorParcela` (número): valor calculado da parcela (sistema PRICE)

#### Exemplo de response (201 Created)

```json
{
  "negociacaoId": 5001,
  "statusNegociacao": "FORMALIZADA",
  "valorParcela": 3298.44
}
```

### ✅ Possíveis retornos

#### **201 — Criado com sucesso**

* A negociação foi criada e o contrato foi marcado como `FORMALIZADA`.

#### **400 — Requisição inválida**

Ocorre quando algum campo é inválido, por exemplo:

* `contratoId` não informado
* `quantidadeParcelas` menor ou igual a 0
* `entradaNegociacao` negativa
* `quantidadeParcelas` fora do mínimo/máximo permitido pela política do tipo do contrato
* `entradaNegociacao` menor do que a entrada mínima exigida

Exemplo (mensagem pode variar):

```json
{
  "title": "Requisição inválida",
  "status": 400,
  "detail": "entradaNegociacao menor que a entrada mínima. Min=12000.00"
}
```

#### **404 — Não encontrado**

* O contrato informado não existe.

Exemplo (mensagem pode variar):

```json
{
  "title": "Não encontrado",
  "status": 404,
  "detail": "Contrato 1001 não encontrado."
}
```

#### **409 — Conflito**

* O contrato já estava `FORMALIZADA` (não pode formalizar de novo).

Exemplo (mensagem pode variar):

```json
{
  "title": "Conflito",
  "status": 409,
  "detail": "Contrato 1001 já está FORMALIZADO."
}
```

\---

## 2\) Consultar negociação

### ✅ O que faz?

Busca os detalhes de uma negociação existente pelo seu `negociacaoId`.

### 🔗 Endpoint

`GET /negociacao/negociacoes/{negociacaoId}`

### 🧩 Parâmetro de rota

* `negociacaoId` (número): ID da negociação a ser consultada

#### Exemplo de chamada

`GET /negociacao/negociacoes/5001`

### 📤 Saída (JSON)

Retorna os dados **fechados** (congelados) da negociação.

Campos principais:

* `negociacaoId`, `contratoId`
* `statusNegociacao`
* `entradaNegociacao`, `quantidadeParcelas`, `valorParcela`
* `valorDesconto`, `saldoRenegociado`, `valorFinanciado`
* `jurosAoMesTaxa`, `iofTaxa`
* `criadoEm`, `atualizadoEm`

#### Exemplo de response (200 OK)

```json
{
  "negociacaoId": 5001,
  "contratoId": 1001,
  "statusNegociacao": "FORMALIZADA",
  "entradaNegociacao": 10000.00,
  "quantidadeParcelas": 24,
  "valorParcela": 3298.44,
  "valorDesconto": 15000.00,
  "saldoRenegociado": 85000.00,
  "valorFinanciado": 75000.00,
  "jurosAoMesTaxa": 0.020000,
  "iofTaxa": 0.003800,
  "criadoEm": "2026-05-20T15:40:11",
  "atualizadoEm": "2026-05-20T15:40:11"
}
```

### ✅ Possíveis retornos

#### **200 — OK**

* Encontrou a negociação e retornou os detalhes.

#### **404 — Não encontrado**

* Não existe negociação com o `negociacaoId` informado.

Exemplo (mensagem pode variar):

```json
{
  "title": "Não encontrado",
  "status": 404,
  "detail": "Negociação 5001 não encontrada."
}
```

\---

## Dicas rápidas (para testar facilmente)

### Testar via Swagger UI

Se seu projeto expõe Swagger/OpenAPI, você pode testar por lá (sem precisar de Postman).

### Testar via `curl`

#### Formalizar (POST)

```bash
curl -X POST "http://localhost:8080/negociacao/negociacoes" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"contratoId":1001,"entradaNegociacao":10000,"quantidadeParcelas":24}'
```

#### Consultar (GET)

```bash
curl -X GET "http://localhost:8080/negociacao/negociacoes/5001" \\\\
  -H "Accept: application/json"
```

\---

## Resumo dos endpoints

* **POST** `/negociacao/negociacoes` → Formaliza uma negociação (cria e fecha)
* **GET** `/negociacao/negociacoes/{negociacaoId}` → Consulta uma negociação existente



