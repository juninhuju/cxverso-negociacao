// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../auth/user.service';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;
  let component: ShellComponent;
  const events$ = new Subject<unknown>();

  const authMock = {
    isLoggedIn: signal(true),
    username: signal('USUARIO'),
    logout: jasmine.createSpy('logout'),
  };

  const userServiceMock = {
    usuario: signal({ id: 1, matricula: 'C123456', nome: 'Usuário', senha: '123456' }),
    carregarUsuario: jasmine.createSpy('carregarUsuario'),
    limpar: jasmine.createSpy('limpar'),
  };

  const routerMock = {
    events: events$.asObservable(),
    navigate: jasmine.createSpy('navigate'),
  };

  const dialogMock = {
    getDialogById: jasmine.createSpy('getDialogById').and.returnValue(null),
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    spyOn(window, 'scrollTo');

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar estado do sidenav', () => {
    expect(component.isSidenavOpen()).toBeFalse();
    component.toggleSidenav();
    expect(component.isSidenavOpen()).toBeTrue();
  });

  it('deve fazer logout e navegar para login', () => {
    component.logout();

    expect(userServiceMock.limpar).toHaveBeenCalled();
    expect(authMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('deve abrir chatbot quando não há diálogo ativo', () => {
    component.openChatbotDialog();

    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('deve resetar scroll em navegação', () => {
    events$.next(new NavigationEnd(1, '/a', '/a'));
    expect(window.scrollTo).toHaveBeenCalled();
  });
});
