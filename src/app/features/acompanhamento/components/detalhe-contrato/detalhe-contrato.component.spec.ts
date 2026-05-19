// import { HttpClient } from '@angular/common/http';
// import { TestBed } from '@angular/core/testing';
// import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
// import { of } from 'rxjs';
// import { DetalheContratoComponent } from './detalhe-contrato.component';

// const testCase = (globalThis as unknown as {
//   it: (description: string, specFn: () => void) => void;
// }).it;

// describe('DetalheContratoComponent', () => {
//   const routerMock = {
//     navigate: jasmine.createSpy('navigate'),
//   };
//   const httpMock = {
//     get: jasmine.createSpy('get'),
//   };
//   let numeroParam: string | null = 'CN-1';

//   const activatedRouteMock = {
//     paramMap: of(convertToParamMap({ numero: numeroParam ?? undefined })),
//   };

//   beforeEach(async () => {
//     numeroParam = 'CN-1';
//     activatedRouteMock.paramMap = of(convertToParamMap({ numero: numeroParam }));
//     routerMock.navigate.calls.reset();
//     httpMock.get.calls.reset();

//     await TestBed.configureTestingModule({
//       imports: [DetalheContratoComponent],
//       providers: [
//         { provide: Router, useValue: routerMock },
//         { provide: HttpClient, useValue: httpMock },
//         { provide: ActivatedRoute, useValue: activatedRouteMock },
//       ],
//     }).compileComponents();
//   });

//   testCase('deve carregar contrato pelo número da rota', () => {
//     httpMock.get.and.returnValue(of([
//       { numero: 'CN-1', cliente: 'A', cpfCnpj: '123', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO' },
//     ]));

//     const fixture = TestBed.createComponent(DetalheContratoComponent);
//     const component = fixture.componentInstance;

//     expect(httpMock.get).toHaveBeenCalledWith('/assets/contratos.json');
//     expect(component.contrato()?.numero).toBe('CN-1');
//   });

//   testCase('não deve buscar contrato quando parâmetro número não existir', () => {
//     numeroParam = null;
//     activatedRouteMock.paramMap = of(convertToParamMap({}));
//     const fixture = TestBed.createComponent(DetalheContratoComponent);
//     const component = fixture.componentInstance;

//     expect(component.contrato()).toBeNull();
//     expect(httpMock.get).not.toHaveBeenCalled();
//   });

//   testCase('deve iniciar renegociação com query param do contrato', () => {
//     httpMock.get.and.returnValue(of([
//       { numero: 'CN-1', cliente: 'A', cpfCnpj: '123', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO' },
//     ]));

//     const fixture = TestBed.createComponent(DetalheContratoComponent);
//     const component = fixture.componentInstance;

//     component.iniciarRenegociacao();

//     expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao'], {
//       queryParams: { contrato: 'CN-1' },
//     });
//   });

//   testCase('deve navegar para acompanhamento no voltar', () => {
//     httpMock.get.and.returnValue(of([]));
//     const fixture = TestBed.createComponent(DetalheContratoComponent);
//     const component = fixture.componentInstance;

//     component.voltar();

//     expect(routerMock.navigate).toHaveBeenCalledWith(['/acompanhamento']);
//   });
// });
