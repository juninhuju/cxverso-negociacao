import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';

// Mock para AuthService
class MockAuthService {
  getToken(): string {
    return '';
  }
}

describe('authInterceptor Functional', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useClass: MockAuthService },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ===================== TESTES BÁSICOS =====================

  it('deve existir um interceptor de autenticação', () => {
    expect(authInterceptor).toBeDefined();
  });

  it('deve ser uma função HttpInterceptorFn', () => {
    expect(typeof authInterceptor).toBe('function');
  });

  it('deve adicionar header Authorization quando token está disponível', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('meu-token');

    // Act
    http.get('/api/dados').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/dados');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer meu-token');
    req.flush({});
  });

  it('não deve adicionar Authorization quando token está vazio', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('');

    // Act
    http.get('/api/dados').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/dados');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('deve preservar headers existentes', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token-abc');

    // Act
    http.get('/api/dados', {
      headers: { 'Custom-Header': 'custom-value' }
    }).subscribe();

    // Assert
    const req = httpMock.expectOne('/api/dados');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    expect(req.request.headers.get('Custom-Header')).toBe('custom-value');
    req.flush({});
  });

  it('deve funcionar com métodos HTTP diferentes', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token');

    // Act - GET
    http.get('/api/dados').subscribe();
    let req = httpMock.expectOne('/api/dados');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({});

    // Act - POST
    http.post('/api/dados', {}).subscribe();
    req = httpMock.expectOne('/api/dados');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({});

    // Act - PUT
    http.put('/api/dados/1', {}).subscribe();
    req = httpMock.expectOne('/api/dados/1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({});

    // Act - DELETE
    http.delete('/api/dados/1').subscribe();
    req = httpMock.expectOne('/api/dados/1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({});
  });

  it('deve passar a requisição para o próximo handler', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token');

    // Act
    http.get('/api/dados').subscribe();

    // Assert - Se não passar para próximo handler, não chegaria a httpMock
    const req = httpMock.expectOne('/api/dados');
    expect(req).toBeDefined();
    req.flush({ data: 'test' });
  });

  it('deve permitir resposta com sucesso', (done) => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token');

    // Act
    http.get('/api/dados').subscribe({
      next: (response: unknown) => {
        expect(response).toEqual({ data: 'test' });
        done();
      },
      error: () => fail('Não deveria ter erro'),
    });

    // Assert
    const req = httpMock.expectOne('/api/dados');
    req.flush({ data: 'test' });
  });

  it('deve permitir que erros passem através', (done) => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token');

    // Act
    http.get('/api/dados').subscribe({
      next: () => fail('Não deveria ter sucesso'),
      error: (error: HttpErrorResponse) => {
        expect(error).toBeDefined();
        done();
      },
    });

    // Assert
    const req = httpMock.expectOne('/api/dados');
    req.error(new ProgressEvent('error'), { status: 500 });
  });

  it('deve preservar body em requisições POST', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token');
    const body = { nome: 'teste', idade: 30 };

    // Act
    http.post('/api/dados', body).subscribe();

    // Assert
    const req = httpMock.expectOne('/api/dados');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('deve formatar Authorization com prefixo Bearer', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('xyz123');

    // Act
    http.get('/api/dados').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/dados');
    const auth = req.request.headers.get('Authorization');
    expect(auth).toMatch(/^Bearer /);
    expect(auth).toBe('Bearer xyz123');
    req.flush({});
  });

  it('não deve incluir Bearer quando token é vazio', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('');

    // Act
    http.get('/api/dados').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/dados');
    const auth = req.request.headers.get('Authorization');
    expect(auth).toBeNull();
    req.flush({});
  });

  it('deve adicionar Authorization em múltiplas requisições', () => {
    // Arrange
    spyOn(authService, 'getToken').and.returnValue('token-consistente');

    // Act
    http.get('/api/dados1').subscribe();
    http.get('/api/dados2').subscribe();
    http.get('/api/dados3').subscribe();

    // Assert
    const req1 = httpMock.expectOne('/api/dados1');
    const req2 = httpMock.expectOne('/api/dados2');
    const req3 = httpMock.expectOne('/api/dados3');

    expect(req1.request.headers.get('Authorization')).toBe('Bearer token-consistente');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer token-consistente');
    expect(req3.request.headers.get('Authorization')).toBe('Bearer token-consistente');

    req1.flush({});
    req2.flush({});
    req3.flush({});
  });

  it('deve usar token atualizado se AuthService mudar', () => {
    // Arrange
    const spy = spyOn(authService, 'getToken');
    spy.and.returnValue('token-v1');

    // Act - Primeira requisição com token-v1
    http.get('/api/dados1').subscribe();
    let req = httpMock.expectOne('/api/dados1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-v1');
    req.flush({});

    // Arrange - Muda o token
    spy.and.returnValue('token-v2');

    // Act - Segunda requisição com token-v2
    http.get('/api/dados2').subscribe();
    req = httpMock.expectOne('/api/dados2');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-v2');
    req.flush({});
  });
});
