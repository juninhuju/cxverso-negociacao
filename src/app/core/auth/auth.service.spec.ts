import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService],
    });
  });

  it('deve iniciar deslogado quando não houver usuário em storage', () => {
    const service = TestBed.inject(AuthService);

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.username()).toBe('');
    expect(service.getToken()).toBe('');
  });

  it('deve refletir usuário salvo em storage no bootstrap', () => {
    localStorage.setItem('auth_user', 'maria');

    const service = TestBed.inject(AuthService);

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.username()).toBe('maria');
    expect(service.getToken()).toBe('mock-token-maria');
  });

  it('deve salvar login no storage e atualizar sinais', () => {
    const service = TestBed.inject(AuthService);

    service.login('joao', '123');

    expect(localStorage.getItem('auth_user')).toBe('joao');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.username()).toBe('joao');
    expect(service.getToken()).toBe('mock-token-joao');
  });

  it('deve limpar storage e estado ao fazer logout', () => {
    const service = TestBed.inject(AuthService);
    service.login('ana', 'senha');

    service.logout();

    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.username()).toBe('');
    expect(service.getToken()).toBe('');
  });
});
