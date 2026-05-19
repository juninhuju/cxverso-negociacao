// import { TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { of } from 'rxjs';
// import { AcompanhamentoDashboardService } from '../../services/acompanhamento-dashboard.service';
// import { DashboardComponent } from './dashboard.component';

// describe('DashboardComponent', () => {
//   const routerMock = {
//     navigate: jasmine.createSpy('navigate'),
//   };
//   const dashboardServiceMock = {
//     listarSolicitacoes: jasmine.createSpy('listarSolicitacoes'),
//     buscarContratosPorDocumento: jasmine.createSpy('buscarContratosPorDocumento'),
//   };

//   beforeEach(async () => {
//     routerMock.navigate.calls.reset();
//     dashboardServiceMock.listarSolicitacoes.calls.reset();
//     dashboardServiceMock.buscarContratosPorDocumento.calls.reset();
//     dashboardServiceMock.listarSolicitacoes.and.returnValue(of([]));
//     dashboardServiceMock.buscarContratosPorDocumento.and.returnValue(of([]));

//     await TestBed.configureTestingModule({
//       imports: [DashboardComponent],
//       providers: [
//         { provide: Router, useValue: routerMock },
//         { provide: AcompanhamentoDashboardService, useValue: dashboardServiceMock },
//       ],
//     }).compileComponents();
//   });

//   it('deve limpar contratos quando documento estiver vazio', () => {
//     const fixture = TestBed.createComponent(DashboardComponent);
//     const component = fixture.componentInstance;

//     component.documento.setValue('');
//     component.contratos.set([
//       {
//         numero: '1',
//         cliente: 'A',
//         cpfCnpj: '123',
//         produto: 'CDC',
//         valorDevido: 1,
//         dataVencimento: '2026-01-01',
//         status: 'APTO',
//       },
//     ]);

//     void component.buscarContratos();

//     expect(component.contratos()).toEqual([]);
//     expect(dashboardServiceMock.buscarContratosPorDocumento).not.toHaveBeenCalled();
//   });

//   it('deve buscar contratos por CPF/CNPJ', async () => {
//     const fixture = TestBed.createComponent(DashboardComponent);
//     const component = fixture.componentInstance;

//     dashboardServiceMock.buscarContratosPorDocumento.and.returnValue(
//       of([
//         {
//           numero: '1',
//           cliente: 'A',
//           cpfCnpj: '12345678901',
//           produto: 'CDC',
//           valorDevido: 1,
//           dataVencimento: '2026-01-01',
//           status: 'APTO',
//         },
//       ]),
//     );

//     component.documento.setValue('123.456.789-01');
//     component.contratoSelecionado.set({
//       numero: '2', cliente: 'B', cpfCnpj: '00000000000', produto: 'CDC', valorDevido: 2, dataVencimento: '2026-01-01', status: 'CEDIDO'
//     });

//     await component.buscarContratos();

//     expect(dashboardServiceMock.buscarContratosPorDocumento).toHaveBeenCalledWith('12345678901');
//     expect(component.contratos().length).toBe(1);
//     expect(component.contratos()[0].cpfCnpj).toBe('12345678901');
//     expect(component.contratoSelecionado()).toBeNull();
//   });

//   it('deve navegar para detalhe do contrato selecionado', () => {
//     const fixture = TestBed.createComponent(DashboardComponent);
//     const component = fixture.componentInstance;

//     component.selecionarContrato({
//       numero: 'CN-1', cliente: 'A', cpfCnpj: '123', produto: 'CDC', valorDevido: 10, dataVencimento: '2026-01-01', status: 'APTO'
//     });

//     expect(routerMock.navigate).toHaveBeenCalledWith(['/acompanhamento/contrato', 'CN-1']);
//   });
// });
