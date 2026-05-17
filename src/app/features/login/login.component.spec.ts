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
});
