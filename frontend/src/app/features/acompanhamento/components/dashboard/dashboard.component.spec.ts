import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AcompanhamentoDashboardService } from '../../services/acompanhamento-dashboard.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const serviceMock = {
    listarSolicitacoes: jasmine.createSpy('listarSolicitacoes').and.returnValue(of([])),
    buscarContratosPorDocumento: jasmine.createSpy('buscarContratosPorDocumento').and.returnValue(of([])),
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AcompanhamentoDashboardService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve buscar contratos por documento', async () => {
    component.documento.set('12345678901');

    await component.buscarContratos();

    expect(serviceMock.buscarContratosPorDocumento).toHaveBeenCalledWith('12345678901');
  });

  it('deve navegar para detalhe ao selecionar contrato', () => {
    component.selecionarContrato({ numero: '10' } as never);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/acompanhamento/contrato', '10']);
  });

  it('deve setar erro ao falhar busca de contratos', async () => {
    serviceMock.buscarContratosPorDocumento.and.returnValue(
      throwError(() => new Error('Falha API')),
    );

    component.documento.set('123');
    await component.buscarContratos();

    expect(component.erroApi()).toBe('Falha API');
  });
});
