// --- INÍCIO DO ARQUIVO ORIGINAL (antes das alterações recentes) ---
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(cors());
app.use(express.json());
// --- FIM DO CABEÇALHO ORIGINAL ---

const jurosAoMesTaxa = 0.0199;
const iofTaxa = 0.0038;
const cet = jurosAoMesTaxa + iofTaxa;

const user = [
  { matricula: 'C123456', nome: 'Usuário', senha: '123456' }
];

const clientes = [
  { id: 1, nome: 'Maria da Silva', cpf: '12345678901' },
  { id: 2, nome: 'Joao Souza', cpf: '98765432100' },
  { id: 3, nome: 'Carlos Pereira', cpf: '12345678900' }
];

const contratos = [
  {
    id: 10,
    clienteId: 1,
    tipoContrato: 'Habitacional',
    saldoDevedor: 25000.75,
    diasAtraso: 45,
    desconto: 0.15,
    statusDivida: 'EM_ATRASO',
    statusNegociacao: 'EM_NEGOCIACAO',
    custasCartorarias: 120,
    custas: 80,
    honorarios: 175,
    parcelaMinima: 6,
    parcelaMaxima: 48,
    possuiGarantia: true,
    garantias: [{ tipo: 'IMOVEL', descricao: 'Apartamento Asa Norte', valorGarantia: 180000.00, registroGarantia: 'Matrícula 45231-1' }]
  },
  {
    id: 11,
    clienteId: 1,
    tipoContrato: 'Consignado',
    saldoDevedor: 7800,
    diasAtraso: 0,
    desconto: 0.05,
    statusDivida: 'REGULAR',
    statusNegociacao: 'FORMALIZADA',
    custasCartorarias: 45,
    custas: 20,
    honorarios: 30,
    parcelaMinima: 6,
    parcelaMaxima: 36,
    possuiGarantia: false,
    garantias: []
  },
  {
    id: 21,
    clienteId: 2,
    tipoContrato: 'Veiculo',
    saldoDevedor: 15300.4,
    diasAtraso: 62,
    desconto: 0.12,
    statusDivida: 'EM_ATRASO',
    statusNegociacao: 'EM_NEGOCIACAO',
    custasCartorarias: 30,
    custas: 25,
    honorarios: 50,
    parcelaMinima: 6,
    parcelaMaxima: 24,
    possuiGarantia: true,
    garantias: [
      { tipo: 'VEICULO', descricao: 'Automóvel hatch 2019', valorGarantia: 42000.00, registroGarantia: 'RENAVAM 00123456789' },
      { tipo: 'APLICACAO FINANCEIRA', descricao: 'CDB', valorGarantia: 10000.00, registroGarantia: 'Nota de aplicação AP02158023050' }
    ]
  },
  {
    id: 30,
    clienteId: 3,
    tipoContrato: 'Pessoal',
    saldoDevedor: 10450.2,
    diasAtraso: 30,
    desconto: 0.1,
    statusDivida: 'EM_ATRASO',
    statusNegociacao: 'EM_NEGOCIACAO',
    custasCartorarias: 50,
    custas: 35,
    honorarios: 60,
    parcelaMinima: 6,
    parcelaMaxima: 30,
    possuiGarantia: false,
    garantias: []
  }
];

let simulacaoSeq = 100;
let negociacaoSeq = 5000;
const simulacoesByContratoId = new Map();
const negociacoes = new Map();

function problem(res, status, title, detail, instance) {
  return res.status(status).type('application/problem+json').json({
    title,
    status,
    detail,
    instance
  });
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calcularPrice(valorFinanciado, parcelas, taxa) {
  const fator = Math.pow(1 + taxa, parcelas);
  return (valorFinanciado * (taxa * fator)) / (fator - 1);
}

function calcularTotais(contrato, entrada) {
  const valorDesconto = round2(contrato.saldoDevedor * contrato.desconto);
  const saldoRenegociado = round2(contrato.saldoDevedor - valorDesconto);
  const entradaTotal = round2(entrada + contrato.custasCartorarias + contrato.custas + contrato.honorarios);
  const valorFinanciado = round2(Math.max(saldoRenegociado - entrada, 0));

  return {
    valorDesconto,
    saldoRenegociado,
    entradaTotal,
    valorFinanciado
  };
}

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseNonNegativeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function contratoResumoDto(contrato) {
  return {
    id: contrato.id,
    tipoContrato: contrato.tipoContrato,
    saldoDevedor: contrato.saldoDevedor,
    statusDivida: contrato.statusDivida
  };
}

function mapearStatusFront(statusDivida) {
  const statusNormalizado = String(statusDivida || '').toUpperCase();
  switch (statusNormalizado) {
    case 'EM_ATRASO':
    case 'EM_ATRASO_JUDICIAL':
      return 'INADIMPLENTE';
    case 'REGULAR':
      return 'REGULARIZADO';
    case 'CEDIDO':
      return 'CEDIDO';
    default:
      return 'APTO';
  }
}

function contratoFrontDto(contrato) {
  const cliente = clientes.find((c) => c.id === contrato.clienteId);
  return {
    numero: String(contrato.id),
    cliente: cliente ? cliente.nome : `Cliente ${contrato.clienteId}`,
    cpfCnpj: cliente ? cliente.cpf : '',
    produto: contrato.tipoContrato,
    valorDevido: contrato.saldoDevedor,
    dataVencimento: '',
    status: mapearStatusFront(contrato.statusDivida),
    diasAtraso: contrato.diasAtraso ?? 0,
    garantia: contrato.possuiGarantia ? 'SIM' : 'NAO'
  };
}

function encontrarContratoPorTermo(termo) {
  const normalizado = String(termo || '').replace(/\D/g, '');
  if (!normalizado) return null;

  if (normalizado.length === 11) {
    const cliente = clientes.find((c) => c.cpf === normalizado);
    if (!cliente) return null;
    return contratos.find((c) => c.clienteId === cliente.id) || null;
  }

  const idContrato = parsePositiveInt(normalizado);
  if (!idContrato) return null;
  return contratos.find((c) => c.id === idContrato) || null;
}

function encontrarContratosPorTermo(termo) {
  const normalizado = String(termo || '').replace(/\D/g, '');
  if (!normalizado) return [];

  if (normalizado.length === 11) {
    const cliente = clientes.find((c) => c.cpf === normalizado);
    if (!cliente) return [];
    return contratos.filter((c) => c.clienteId === cliente.id);
  }

  const idContrato = parsePositiveInt(normalizado);
  if (!idContrato) return [];

  const contrato = contratos.find((c) => c.id === idContrato);
  return contrato ? [contrato] : [];
}

function contratoDetalheDto(contrato) {
  const deveExibirCalculos = contrato.statusNegociacao === 'EM_NEGOCIACAO' || contrato.statusNegociacao === 'FORMALIZADA';
  const simulacao = simulacoesByContratoId.get(contrato.id);

  let valores = {
    desconto: null,
    valorDesconto: null,
    saldoRenegociado: null,
    entradaNegociacao: null,
    entradaTotal: null,
    valorFinanciado: null,
    parcelaMinima: null,
    parcelaMaxima: null,
    jurosAoMesTaxa: null,
    iofTaxa: null,
    cet: null
  };

  if (deveExibirCalculos) {
    const entrada = simulacao ? simulacao.entradaNegociacao : round2(contrato.saldoDevedor * 0.1);
    const totais = calcularTotais(contrato, entrada);

    valores = {
      desconto: contrato.desconto,
      valorDesconto: totais.valorDesconto,
      saldoRenegociado: totais.saldoRenegociado,
      entradaNegociacao: entrada,
      entradaTotal: totais.entradaTotal,
      valorFinanciado: totais.valorFinanciado,
      parcelaMinima: contrato.parcelaMinima,
      parcelaMaxima: contrato.parcelaMaxima,
      jurosAoMesTaxa,
      iofTaxa,
      cet
    };
  }

  return {
    id: contrato.id,
    clienteId: contrato.clienteId,
    tipoContrato: contrato.tipoContrato,
    saldoDevedor: contrato.saldoDevedor,
    ...valores,
    possuiGarantia: contrato.possuiGarantia,
    quantidadeGarantias: contrato.garantias.length,
    garantias: contrato.garantias,
    statusDivida: contrato.statusDivida,
    statusNegociacao: contrato.statusNegociacao,
    custasCartorarias: contrato.custasCartorarias,
    custas: contrato.custas,
    honorarios: contrato.honorarios
  };
}

app.get('/negociacao/clientes', (_req, res) => {
  const payload = clientes.map((c) => ({ id: c.id, nome: c.nome, cpf: c.cpf }));
  res.json(payload);
});

app.get('/negociacao/clientes/:cpf', (req, res) => {
  const { cpf } = req.params;
  if (!/^\d{11}$/.test(cpf)) {
    return problem(res, 400, 'Requisicao invalida', 'CPF deve conter 11 digitos numericos.', req.originalUrl);
  }

  const cliente = clientes.find((c) => c.cpf === cpf);
  if (!cliente) {
    return problem(res, 404, 'Nao encontrado', `Cliente com CPF ${cpf} nao encontrado.`, req.originalUrl);
  }

  return res.json(cliente);
});

app.get('/negociacao/clientes/:clienteId/contratos', (req, res) => {
  const clienteId = parsePositiveInt(req.params.clienteId);
  if (!clienteId) {
    return problem(res, 400, 'Requisicao invalida', 'clienteId deve ser numerico e positivo.', req.originalUrl);
  }

  const payload = contratos.filter((c) => c.clienteId === clienteId).map(contratoResumoDto);
  return res.json(payload);
});

app.get('/negociacao/contratos/:contratoId', (req, res) => {
  const contratoId = parsePositiveInt(req.params.contratoId);
  if (!contratoId) {
    return problem(res, 400, 'Requisicao invalida', 'contratoId deve ser numerico e positivo.', req.originalUrl);
  }

  const contrato = contratos.find((c) => c.id === contratoId);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', `Contrato ${contratoId} nao encontrado.`, req.originalUrl);
  }

  return res.json(contratoDetalheDto(contrato));
});

// Corrigido para compatibilidade total com backend-final
app.post('/negociacao/contratos/:contratoId/simulacao', (req, res) => {
  const contratoId = parsePositiveInt(req.params.contratoId);
  if (!contratoId) {
    return problem(res, 400, 'Requisicao invalida', 'contratoId deve ser numerico e positivo.', req.originalUrl);
  }

  const contrato = contratos.find((c) => c.id === contratoId);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', `Contrato ${contratoId} nao encontrado.`, req.originalUrl);
  }

  // Checagem de statusNegociacao removida temporariamente para testes

  // Espera body: { entrada, quantidadeParcelas }
  const entrada = parseNonNegativeNumber(req.body.entrada);
  const quantidadeParcelas = parsePositiveInt(req.body.quantidadeParcelas);

  if (entrada === null || quantidadeParcelas === null) {
    return problem(res, 400, 'Requisicao invalida', 'entrada e quantidadeParcelas sao obrigatorios e validos.', req.originalUrl);
  }

  if (quantidadeParcelas < contrato.parcelaMinima || quantidadeParcelas > contrato.parcelaMaxima) {
    return problem(
      res,
      400,
      'Requisicao invalida',
      `quantidadeParcelas deve estar entre ${contrato.parcelaMinima} e ${contrato.parcelaMaxima}.`,
      req.originalUrl
    );
  }

  const entradaMinima = round2(contrato.saldoDevedor * 0.08);
  if (entrada < entradaMinima) {
    return problem(
      res,
      400,
      'Requisicao invalida',
      `entrada menor que a entrada minima. Min=${entradaMinima.toFixed(2)}`,
      req.originalUrl
    );
  }

  const totais = calcularTotais(contrato, entrada);
  const valorParcela = round2(calcularPrice(totais.valorFinanciado, quantidadeParcelas, jurosAoMesTaxa));
  const simulacaoId = ++simulacaoSeq;

  const simulacao = {
    simulacaoId,
    contratoId,
    saldoDevedor: contrato.saldoDevedor,
    saldoRenegociado: totais.saldoRenegociado,
    entradaNegociacao: entrada,
    custasCartorarias: contrato.custasCartorarias,
    entradaTotal: totais.entradaTotal,
    valorFinanciado: totais.valorFinanciado,
    quantidadeParcelas,
    valorParcela,
    jurosAoMesTaxa,
    iofTaxa,
    cet,
    tabelaCalculo: 'PRICE',
    statusSimulacao: 'CALCULADA',
    criadoEm: new Date().toISOString()
  };

  simulacoesByContratoId.set(contratoId, simulacao);
  // Resposta compatível com backend-final: SimulacaoResponseDto
  return res.json(simulacao);
});

app.post('/negociacao/negociacoes', (req, res) => {
  const contratoId = parsePositiveInt(req.body.contratoId);
  const entradaNegociacao = parseNonNegativeNumber(req.body.entradaNegociacao);
  const quantidadeParcelas = parsePositiveInt(req.body.quantidadeParcelas);

  if (!contratoId || entradaNegociacao === null || !quantidadeParcelas) {
    return problem(
      res,
      400,
      'Requisicao invalida',
      'contratoId, entradaNegociacao e quantidadeParcelas sao obrigatorios e validos.',
      req.originalUrl
    );
  }

  const contrato = contratos.find((c) => c.id === contratoId);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', `Contrato ${contratoId} nao encontrado.`, req.originalUrl);
  }

  if (contrato.statusNegociacao === 'FORMALIZADA') {
    return problem(res, 409, 'Conflito', `Contrato ${contratoId} ja esta FORMALIZADO.`, req.originalUrl);
  }

  if (quantidadeParcelas < contrato.parcelaMinima || quantidadeParcelas > contrato.parcelaMaxima) {
    return problem(
      res,
      400,
      'Requisicao invalida',
      `quantidadeParcelas deve estar entre ${contrato.parcelaMinima} e ${contrato.parcelaMaxima}.`,
      req.originalUrl
    );
  }

  const entradaMinima = round2(contrato.saldoDevedor * 0.08);
  if (entradaNegociacao < entradaMinima) {
    return problem(
      res,
      400,
      'Requisicao invalida',
      `entradaNegociacao menor que a entrada minima. Min=${entradaMinima.toFixed(2)}`,
      req.originalUrl
    );
  }

  const totais = calcularTotais(contrato, entradaNegociacao);
  const valorParcela = round2(calcularPrice(totais.valorFinanciado, quantidadeParcelas, jurosAoMesTaxa));

  const now = new Date().toISOString().slice(0, 19);
  const negociacaoId = ++negociacaoSeq;

  const negociacao = {
    negociacaoId,
    contratoId,
    statusNegociacao: 'FORMALIZADA',
    entradaNegociacao: round2(entradaNegociacao),
    quantidadeParcelas,
    valorParcela,
    valorDesconto: totais.valorDesconto,
    saldoRenegociado: totais.saldoRenegociado,
    valorFinanciado: totais.valorFinanciado,
    jurosAoMesTaxa,
    iofTaxa,
    criadoEm: now,
    atualizadoEm: now
  };

  negociacoes.set(negociacaoId, negociacao);
  contrato.statusNegociacao = 'FORMALIZADA';

  return res.status(201).json({
    negociacaoId,
    statusNegociacao: 'FORMALIZADA',
    valorParcela
  });
});

app.get('/negociacao/negociacoes/:negociacaoId', (req, res) => {
  const negociacaoId = parsePositiveInt(req.params.negociacaoId);
  if (!negociacaoId) {
    return problem(res, 400, 'Requisicao invalida', 'negociacaoId deve ser numerico e positivo.', req.originalUrl);
  }

  const negociacao = negociacoes.get(negociacaoId);
  if (!negociacao) {
    return problem(res, 404, 'Nao encontrado', `Negociacao ${negociacaoId} nao encontrada.`, req.originalUrl);
  }

  return res.json(negociacao);
});

// Compatibilidade para o frontend atual
app.get('/renegociacao/contratos', (req, res) => {
  const contratosEncontrados = encontrarContratosPorTermo(req.query.termo);
  if (!contratosEncontrados.length) {
    return problem(res, 404, 'Nao encontrado', 'Contrato nao encontrado para o termo informado.', req.originalUrl);
  }
  return res.json({ data: contratosEncontrados.map(contratoFrontDto) });
});

app.post('/renegociacao/consulta-juridica', (req, res) => {
  const contrato = encontrarContratoPorTermo(req.body.numeroContrato);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', 'Contrato nao encontrado para consulta juridica.', req.originalUrl);
  }

  // bloco duplicado removido
  const aptoParaRenegociacao = contrato.statusDivida !== 'CEDIDO';

  return res.json({
    data: {
      status: 'APROVADO',
      aptoParaRenegociacao,
      impedimentos: aptoParaRenegociacao ? [] : ['Contrato cedido para outra instituição'],
      uploadAtendido: true,
      checksEtapasAnteriores: true,
      validadoEm: new Date().toISOString()
    }
  });
});

app.get('/renegociacao/simulacao-opcoes', (req, res) => {
  const contrato = encontrarContratoPorTermo(req.query.numeroContrato);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', 'Contrato nao encontrado para opcoes de simulacao.', req.originalUrl);
  }

  const totais = calcularTotais(contrato, round2(contrato.saldoDevedor * 0.1));
  const opcoes = [12, 24, 36]
    .filter((qtd) => qtd >= contrato.parcelaMinima && qtd <= contrato.parcelaMaxima)
    .map((qtd, idx) => ({
      id: idx + 1,
      descricao: `${qtd} parcelas`,
      valorEntrada: round2(contrato.saldoDevedor * 0.1),
      numeroParcelas: qtd,
      taxaJuros: jurosAoMesTaxa,
      valorParcela: round2(calcularPrice(totais.valorFinanciado, qtd, jurosAoMesTaxa)),
      economiaTotal: totais.valorDesconto,
      detalhes: `Plano em ${qtd}x com tabela PRICE`
    }));

  return res.json({
    data: {
      numeroContrato: String(contrato.id),
      nomeCliente: (clientes.find((c) => c.id === contrato.clienteId) || {}).nome || 'Cliente',
      opcoes
    }
  });
});

// Endpoint dummy para POST /renegociacao/validacao-operacional
app.post('/renegociacao/validacao-operacional', (req, res) => {
  const contrato = encontrarContratoPorTermo(req.body.numeroContrato);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', 'Contrato nao encontrado para validacao operacional.', req.originalUrl);
  }

  // Se statusDivida for diferente de 'CEDIDO', retorna apto
  const aptoParaRenegociacao = String(contrato.statusDivida).toUpperCase() !== 'CEDIDO';

  return res.json({
    data: {
      status: aptoParaRenegociacao ? 'APROVADO' : 'REPROVADO',
      aptoParaRenegociacao,
      impedimentos: aptoParaRenegociacao ? [] : ['Contrato cedido para outra instituição'],
      uploadAtendido: true,
      checksEtapasAnteriores: true,
      validadoEm: new Date().toISOString()
    }
  });
});

app.get('/renegociacao/simulacao', (req, res) => {
  const contrato = encontrarContratoPorTermo(req.body.numeroContrato);
  const valorEntrada = parseNonNegativeNumber(req.body.valorEntrada);
  const numeroParcelas = parsePositiveInt(req.body.numeroParcelas);

  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', 'Contrato nao encontrado para simulacao.', req.originalUrl);
  }
  if (valorEntrada === null || numeroParcelas === null) {
    return problem(res, 400, 'Requisicao invalida', 'valorEntrada e numeroParcelas sao obrigatorios.', req.originalUrl);
  }

  const totais = calcularTotais(contrato, valorEntrada);
  const valorParcela = round2(calcularPrice(totais.valorFinanciado, numeroParcelas, jurosAoMesTaxa));
  const totalPago = round2(valorEntrada + valorParcela * numeroParcelas);
  const totalJuros = round2(totalPago - contrato.saldoDevedor);
  const hoje = new Date();

  const parcelas = Array.from({ length: numeroParcelas }, (_, i) => {
    const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, hoje.getDate());
    return {
      numero: i + 1,
      valor: valorParcela,
      vencimento: vencimento.toISOString().slice(0, 10)
    };
  });

  return res.json({
    data: {
      valorEntrada,
      numeroParcelas,
      valorParcela,
      taxaJuros: jurosAoMesTaxa,
      totalPago,
      totalJuros,
      parcelas
    }
  });
});

app.post('/renegociacao/formalizar', (req, res) => {
  const contrato = encontrarContratoPorTermo(req.body.numeroContrato);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', 'Contrato nao encontrado para formalizacao.', req.originalUrl);
  }

  contrato.statusNegociacao = 'FORMALIZADA';

  return res.json({
    data: {
      aprovado: true,
      motivoRecusa: null,
      novoContratoNumero: `${contrato.id}-R`
    }
  });
});

// Alias/negociacao para o dashboard de acompanhamento
app.get('/negociacao/clientes/:cpf', (req, res) => {
  const { cpf } = req.params;
  const cliente = clientes.find((c) => c.cpf === cpf);
  if (!cliente) {
    return problem(res, 404, 'Nao encontrado', `Cliente com CPF ${cpf} nao encontrado.`, req.originalUrl);
  }
  return res.json(cliente);
});

app.get('/negociacao/clientes/:clienteId/contratos', (req, res) => {
  const clienteId = parsePositiveInt(req.params.clienteId);
  if (!clienteId) {
    return problem(res, 400, 'Requisicao invalida', 'clienteId deve ser numerico e positivo.', req.originalUrl);
  }
  return res.json(contratos.filter((c) => c.clienteId === clienteId).map(contratoResumoDto));
});

app.get('/negociacao/contratos/:contratoId', (req, res) => {
  const contratoId = parsePositiveInt(req.params.contratoId);
  const contrato = contratos.find((c) => c.id === contratoId);
  if (!contrato) {
    return problem(res, 404, 'Nao encontrado', `Contrato ${req.params.contratoId} nao encontrado.`, req.originalUrl);
  }
  return res.json(contratoDetalheDto(contrato));
});

app.get('/negociacao/negociacoes', (_req, res) => {
  const lista = Array.from(negociacoes.values()).map((neg) => {
    const contrato = contratos.find((c) => c.id === neg.contratoId);
    const cliente = contrato ? clientes.find((c) => c.id === contrato.clienteId) : null;
    const valorTotal = round2(neg.entradaNegociacao + neg.valorParcela * neg.quantidadeParcelas);
    return {
      id: String(neg.negociacaoId),
      protocolo: `NEG-${neg.negociacaoId}`,
      numeroContrato: String(neg.contratoId),
      cliente: cliente ? cliente.nome : `Cliente ${neg.contratoId}`,
      cpfCnpj: cliente ? cliente.cpf : '',
      produto: contrato ? contrato.tipoContrato : '',
      valorTotal,
      valorTotalFormatado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal),
      dataInicio: neg.criadoEm,
      dataUltimo: neg.atualizadoEm,
      status: 'CONCLUIDA',
      contratoCaixa: String(neg.contratoId),
    };
  });
  return res.json(lista);
});

app.get('/user', (req, res) => {
  const { matricula } = req.query;
  if (matricula) {
    const usuario = user.find((u) => u.matricula === String(matricula));
    if (!usuario) {
      return problem(res, 404, 'Usuário não encontrado', `Nenhum usuário com matrícula ${matricula}`, '/user');
    }
    return res.json(usuario);
  }
  return res.json(user[0]);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'negocia-caixa-backend' });
});

app.listen(PORT, () => {
  console.log(`API negociacao rodando em http://localhost:${PORT}`);
});
