import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ShellComponent } from './shell.component';

const testCase = (globalThis as unknown as {
  it: (description: string, specFn: () => void) => void;
}).it;

describe('ShellComponent', () => {
  const authMock = {
    username: () => 'usuario',
    logout: jasmine.createSpy('logout'),
  };
  const routerMock = {
    events: of(new NavigationEnd(1, '/inicial', '/inicial')),
    navigate: jasmine.createSpy('navigate'),
  };
  const dialogMock = {
    getDialogById: jasmine.createSpy('getDialogById').and.returnValue(null),
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    authMock.logout.calls.reset();
    routerMock.navigate.calls.reset();
    dialogMock.getDialogById.calls.reset();
    dialogMock.getDialogById.and.returnValue(null);
    dialogMock.open.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      .overrideProvider(MatDialog, { useValue: dialogMock })
      .overrideComponent(ShellComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  testCase('deve alternar estado do sidenav', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance;

    expect(component.isSidenavOpen()).toBeFalse();
    component.toggleSidenav();
    expect(component.isSidenavOpen()).toBeTrue();
    component.toggleSidenav();
    expect(component.isSidenavOpen()).toBeFalse();
  });

  testCase('deve fechar sidenav', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance;

    component.isSidenavOpen.set(true);
    component.closeSidenav();

    expect(component.isSidenavOpen()).toBeFalse();
  });

  testCase('deve executar logout e navegar para login', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance;

    component.logout();

    expect(authMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  testCase('deve abrir modal do chatbot quando nao houver dialog aberto', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance;

    component.openChatbotDialog();

    expect(dialogMock.getDialogById).toHaveBeenCalled();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  testCase('deve formatar data atual com primeira letra maiúscula', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance;

    const valor = component.dataAtual();

    expect(valor.length).toBeGreaterThan(0);
    expect(valor.charAt(0)).toBe(valor.charAt(0).toUpperCase());
  });

  testCase('deve executar onRouteActivate sem erro', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance as unknown as { onRouteActivate: () => void };

    expect(() => component.onRouteActivate()).not.toThrow();
  });

  testCase('deve retornar data bruta quando formatador não incluir vírgula', () => {
    const formatSpy = spyOn(Intl, 'DateTimeFormat').and.returnValue({
      format: () => 'sem separador',
    } as unknown as Intl.DateTimeFormat);

    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance as unknown as { formatarDataAtual: () => string };

    expect(component.formatarDataAtual()).toBe('sem separador');

    formatSpy.and.callThrough();
  });

  testCase('deve capitalizar texto e manter vazio sem alteração', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const component = fixture.componentInstance as unknown as {
      capitalizeFirst: (texto: string) => string;
    };

    expect(component.capitalizeFirst('')).toBe('');
    expect(component.capitalizeFirst('teste')).toBe('Teste');
  });
});
