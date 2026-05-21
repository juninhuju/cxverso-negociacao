// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, jasmine: any, spyOn: any;
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('deve iniciar deslogado sem token válido', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBe('');
    expect(service.username()).toBe('');
  });

  it('deve criar token válido ao fazer login', () => {
    service.login('C123456', '123456');

    const token = service.getToken();
    expect(token).toContain('.');
    expect(token.split('.').length).toBe(3);
    expect(service.hasValidToken()).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.username()).toBe('C123456');
  });

  it('deve invalidar token malformado', () => {
    localStorage.setItem('auth_user', 'C123456');
    localStorage.setItem('auth_token', 'token-invalido');
    service = TestBed.inject(AuthService);

    expect(service.hasValidToken()).toBeFalse();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBe('');
  });

  it('deve invalidar token expirado', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const payload = btoa(
      JSON.stringify({ sub: 'C123456', iat: 1700000000, exp: 1700000100 }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    localStorage.setItem('auth_user', 'C123456');
    localStorage.setItem('auth_token', `${header}.${payload}.mock-signature`);

    service = TestBed.inject(AuthService);

    expect(service.hasValidToken()).toBeFalse();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBe('');
  });

  it('deve limpar sessão no logout', () => {
    service.login('C123456', '123456');
    service.logout();

    expect(service.hasValidToken()).toBeFalse();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
