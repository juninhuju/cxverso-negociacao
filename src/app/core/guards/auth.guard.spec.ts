import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  const runGuard = () => TestBed.runInInjectionContext(() => authGuard(route, state));

  // ===================== TESTES DE ACESSO PERMITIDO =====================

  it('deve permitir acesso quando usuário está autenticado', () => {
    authService.isLoggedIn.and.returnValue(true);

    const result = runGuard();

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('deve permitir múltiplas acessos autenticados', () => {
    authService.isLoggedIn.and.returnValue(true);

    const result1 = runGuard();
    const result2 = runGuard();

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  // ===================== TESTES DE BLOQUEIO DE ACESSO =====================

  it('deve bloquear acesso quando usuário NÃO está autenticado', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    const result = runGuard();

    expect(result).toEqual(mockUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('deve redirecionar para /login quando não autenticado', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    runGuard();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('deve bloquear acesso em múltiplas tentativas sem autenticação', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    runGuard();
    runGuard();

    expect(router.createUrlTree).toHaveBeenCalledTimes(2);
  });

  // ===================== TESTES DE MUDANÇA DE ESTADO =====================

  it('deve permitir acesso ao mudar de não autenticado para autenticado', () => {
    authService.isLoggedIn.and.returnValue(false);
    let result1 = runGuard();
    expect(result1).not.toBe(true);

    authService.isLoggedIn.and.returnValue(true);
    result1 = runGuard();
    expect(result1).toBe(true);
  });

  it('deve bloquear acesso ao mudar de autenticado para não autenticado', () => {
    authService.isLoggedIn.and.returnValue(true);
    let result1 = runGuard();
    expect(result1).toBe(true);

    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);
    result1 = runGuard();
    expect(result1).toEqual(mockUrlTree);
  });

  // ===================== TESTES DE INJEÇÃO =====================

  it('deve injetar AuthService corretamente', () => {
    authService.isLoggedIn.and.returnValue(true);

    runGuard();

    expect(authService.isLoggedIn).toHaveBeenCalled();
  });

  it('deve injetar Router corretamente', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    runGuard();

    expect(router.createUrlTree).toHaveBeenCalled();
  });

  // ===================== TESTES DE CENÁRIOS EDGE CASE =====================

  it('deve lidar com AuthService retornando undefined', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    runGuard();

    // Falsy value deve redirecionar
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('deve lidar com AuthService retornando null', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    runGuard();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('deve lidar com AuthService retornando valor falsy', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    runGuard();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  // ===================== TESTES DE COBERTURA DE BRANCHES =====================

  it('deve passar pela branch de autenticado (true)', () => {
    authService.isLoggedIn.and.returnValue(true);

    const result = runGuard();

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('deve passar pela branch de não autenticado (createUrlTree)', () => {
    authService.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as ReturnType<Router['createUrlTree']>;
    router.createUrlTree.and.returnValue(mockUrlTree);

    const result = runGuard();

    expect(result).toEqual(mockUrlTree);
    expect(router.createUrlTree).toHaveBeenCalled();
  });
});
