import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  it('deve permitir acesso com token válido', () => {
    const authMock = {
      hasValidToken: jasmine.createSpy().and.returnValue(true),
    } as Pick<AuthService, 'hasValidToken'>;

    const routerMock = {
      createUrlTree: jasmine.createSpy(),
    } as Pick<Router, 'createUrlTree'>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBeTrue();
    expect(authMock.hasValidToken).toHaveBeenCalled();
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('deve redirecionar para /login sem token válido', () => {
    const authMock = {
      hasValidToken: jasmine.createSpy().and.returnValue(false),
    } as Pick<AuthService, 'hasValidToken'>;

    const urlTree = {} as UrlTree;
    const routerMock = {
      createUrlTree: jasmine.createSpy().and.returnValue(urlTree),
    } as Pick<Router, 'createUrlTree'>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(urlTree);
    expect(authMock.hasValidToken).toHaveBeenCalled();
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
