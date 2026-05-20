import { HttpErrorResponse } from '@angular/common/http';

interface ProblemDetails {
  readonly title?: string;
  readonly detail?: string;
  readonly status?: number;
}

function extrairMensagemProblemDetails(error: HttpErrorResponse): string | null {
  const body = error.error as ProblemDetails | null;
  const detail = body?.detail?.trim();
  const title = body?.title?.trim();
  return detail || title || null;
}

export function buildFriendlyApiErrorMessage(error: unknown, contexto: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return `Nao foi possivel ${contexto}. Tente novamente em instantes.`;
  }

  const detalhe = extrairMensagemProblemDetails(error);

  switch (error.status) {
    case 0:
      return `Falha na comunicacao com a API ao ${contexto}. Verifique a conexao ou disponibilidade do servico.`;
    case 400:
      return detalhe ?? `Nao foi possivel ${contexto}: dados enviados sao invalidos (erro 400).`;
    case 401:
      return detalhe ?? `Nao autorizado ao ${contexto}. Faca login novamente.`;
    case 403:
      return detalhe ?? `Acesso negado ao ${contexto} (erro 403).`;
    case 404:
      return detalhe ?? `Nao foram encontrados dados para ${contexto} (erro 404).`;
    case 409:
      return detalhe ?? `Conflito de regra de negocio ao ${contexto} (erro 409).`;
    case 422:
      return detalhe ?? `Nao foi possivel ${contexto}: validacao de negocio rejeitou a solicitacao (erro 422).`;
    case 500:
      return detalhe ?? `Erro interno da API ao ${contexto} (erro 500).`;
    case 503:
      return detalhe ?? `Servico indisponivel ao ${contexto} (erro 503). Tente novamente mais tarde.`;
    default:
      return detalhe ?? `Nao foi possivel ${contexto} (erro ${error.status || 'desconhecido'}).`;
  }
}
