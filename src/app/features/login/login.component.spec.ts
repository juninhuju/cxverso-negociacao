import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RenegociacaoFacade } from '../../states/renegociacao/renegociacao.facade';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const authMock = {
    login: jasmine.createSpy('login'),
  };
  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };
  const errorSignal = signal<string | null>(null);
  const contratoSignal = signal<{
    numero: string;
    cliente: string;
    cpfCnpj: string;
    produto: string;
    valorDevido: number;
    dataVencimento: string;
    status: 'APTO';
  } | null>(null);
  const facadeMock = {
    buscarContrato: jasmine.createSpy('buscarContrato'),
    error: errorSignal,
    contrato: contratoSignal,
  };

  beforeEach(async () => {
    authMock.login.calls.reset();
    routerMock.navigate.calls.reset();
    facadeMock.buscarContrato.calls.reset();
    errorSignal.set(null);
    contratoSignal.set(null);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: RenegociacaoFacade, useValue: facadeMock },
      ],
    }).compileComponents();
  });

  it('deve ignorar entrada com username vazio', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.username.set('   ');
    component.password.set('123');

    component.entrar();

    expect(authMock.login).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve autenticar e navegar quando username informado', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.username.set('  maria  ');
    component.password.set('senha');

    component.entrar();

    expect(authMock.login).toHaveBeenCalledWith('maria', 'senha');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao']);
  });

  it('deve alternar visibilidade da senha', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    expect(component.hidePassword()).toBeTrue();
    component.toggleHidePassword();
    expect(component.hidePassword()).toBeFalse();
    component.toggleHidePassword();
    expect(component.hidePassword()).toBeTrue();
  });

  it('deve disparar busca de contrato pelo termo informado', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.termoBusca.set(' 123 ');
    component.buscarContrato();

    expect(facadeMock.buscarContrato).toHaveBeenCalledWith('123');
  });

  it('não deve buscar contrato com termo vazio', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.termoBusca.set('   ');
    component.buscarContrato();

    expect(facadeMock.buscarContrato).not.toHaveBeenCalled();
  });

  it('deve navegar quando retorno da busca corresponder ao termo (numero)', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.termoBusca.set('123');
    component.buscarContrato();

    contratoSignal.set({
      numero: '123',
      cliente: 'Cliente A',
      cpfCnpj: '11111111111',
      produto: 'CDC',
      valorDevido: 1000,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    });
    fixture.detectChanges();

    expect(authMock.login).toHaveBeenCalledWith('Cliente A', '');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao'], {
      state: { contratoSelecionado: contratoSignal() },
    });
  });

  it('deve navegar quando retorno da busca corresponder ao CPF/CNPJ normalizado', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.termoBusca.set('123.456.789-01');
    component.buscarContrato();

    contratoSignal.set({
      numero: '999',
      cliente: 'Cliente B',
      cpfCnpj: '12345678901',
      produto: 'CDC',
      valorDevido: 1000,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    });
    fixture.detectChanges();

    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('não deve navegar quando contrato retornado não corresponder ao termo', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.termoBusca.set('777');
    component.buscarContrato();

    contratoSignal.set({
      numero: '123',
      cliente: 'Cliente C',
      cpfCnpj: '11111111111',
      produto: 'CDC',
      valorDevido: 1000,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    });
    fixture.detectChanges();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve exibir e limpar erro temporário quando facade retornar erro', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(LoginComponent);
      const component = fixture.componentInstance;

      component.termoBusca.set('123');
      component.buscarContrato();
      errorSignal.set('falha');
      fixture.detectChanges();

      expect(component.erroSync()).toBe('Contrato não encontrado');

      jasmine.clock().tick(3000);
      expect(component.erroSync()).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
