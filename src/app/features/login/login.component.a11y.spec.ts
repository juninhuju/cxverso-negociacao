import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expectNoSeriousA11yViolations } from '../../../testing/axe-accessibility';
import { AuthService } from '../../core/auth/auth.service';
import { RenegociacaoFacade } from '../../states/renegociacao/renegociacao.facade';
import { LoginComponent } from './login.component';

describe('LoginComponent A11y', () => {
  const authMock = {
    login: jasmine.createSpy('login'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const facadeMock = {
    buscarContrato: jasmine.createSpy('buscarContrato'),
    error: signal<string | null>(null),
    contrato: signal(null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: RenegociacaoFacade, useValue: facadeMock },
      ],
    }).compileComponents();
  });

  it('deve atender regras WCAG A/AA sem violacoes graves', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
