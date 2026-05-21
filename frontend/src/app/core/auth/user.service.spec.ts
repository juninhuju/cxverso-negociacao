// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve carregar usuário da API sem matrícula', () => {
    service.carregarUsuario();

    const req = httpMock.expectOne(`${environment.bffUrl}/user`);
    expect(req.request.method).toBe('GET');

    req.flush({ id: 1, matricula: 'C123456', nome: 'Usuário', senha: '123456' });

    expect(service.usuario()).toEqual({
      id: 1,
      matricula: 'C123456',
      nome: 'Usuário',
      senha: '123456',
    });
  });

  it('deve carregar usuário da API com matrícula', () => {
    service.carregarUsuario('C123456');

    const req = httpMock.expectOne(`${environment.bffUrl}/user?matricula=C123456`);
    expect(req.request.method).toBe('GET');

    req.flush({ id: 1, matricula: 'C123456', nome: 'Usuário', senha: '123456' });

    expect(service.usuario()?.matricula).toBe('C123456');
  });

  it('deve limpar usuário do storage no logout local', () => {
    localStorage.setItem(
      'negocia_caixa_usuario',
      JSON.stringify({ id: 1, matricula: 'C123456', nome: 'Usuário', senha: '123456' }),
    );

    service = TestBed.inject(UserService);
    expect(service.usuario()?.nome).toBe('Usuário');

    service.limpar();

    expect(localStorage.getItem('negocia_caixa_usuario')).toBeNull();
    expect(service.usuario()).toBeNull();
  });
});
