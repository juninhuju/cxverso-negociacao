import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    authMock.logout.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    })
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
});
