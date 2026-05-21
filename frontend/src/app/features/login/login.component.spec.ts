import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/auth/user.service';
import { RenegociacaoFacade } from '../../states/renegociacao/renegociacao.facade';
import { Contrato } from '../renegociacao/models/renegociacao.model';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  const contratoMock: Contrato = {
    numero: '10',
    cliente: 'Maria da Silva',
    cpfCnpj: '12345678901',
    produto: 'Empréstimo Comercial',
    valorDevido: 85000,
    dataVencimento: '',
    status: 'INADIMPLENTE',
  };

  const authMock = {
    login: jasmine.createSpy('login'),
  };

  const userServiceMock = {
    carregarUsuario: jasmine.createSpy('carregarUsuario'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const facadeMock = {
    error: signal<string | null>(null),
    contrato: signal<Contrato | null>(null),
    buscarContrato: jasmine.createSpy('buscarContrato'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: RenegociacaoFacade, useValue: facadeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve fazer login quando usuário for informado', () => {
    component.username.set('C123456');
    component.password.set('123456');

    component.entrar();

    expect(authMock.login).toHaveBeenCalledWith('C123456', '123456');
    expect(userServiceMock.carregarUsuario).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao']);
  });

  it('deve buscar contrato quando termo for preenchido', () => {
    component.termoBusca.set('12345678901');

    component.buscarContrato();

    expect(facadeMock.buscarContrato).toHaveBeenCalledWith('12345678901');
  });

  it('deve navegar ao receber contrato correspondente', () => {
    component.termoBusca.set('12345678901');
    component.buscarContrato();

    facadeMock.contrato.set(contratoMock);
    fixture.detectChanges();

    expect(authMock.login).toHaveBeenCalledWith('Maria da Silva', '');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao'], {
      state: { contratoSelecionado: contratoMock },
    });
  });
});
