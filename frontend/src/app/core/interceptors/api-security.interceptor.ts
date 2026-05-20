import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.bffUrl);
}

function buildCorrelationId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return uuid;
  }

  return `cid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const apiSecurityInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (!isApiRequest(req.url)) {
    return next(req);
  }

  const securedReq = req.clone({
    setHeaders: {
      'X-Correlation-Id': req.headers.get('X-Correlation-Id') ?? buildCorrelationId(),
      'X-Request-Timestamp': req.headers.get('X-Request-Timestamp') ?? new Date().toISOString(),
      'X-Client-Channel': req.headers.get('X-Client-Channel') ?? 'WEB',
      Accept: req.headers.get('Accept') ?? 'application/json',
    },
  });

  return next(securedReq);
};
