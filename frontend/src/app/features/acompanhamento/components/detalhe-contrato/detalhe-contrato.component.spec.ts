import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AcompanhamentoDashboardService } from '../../services/acompanhamento-dashboard.service';
import { DetalheContratoComponent } from './detalhe-contrato.component';

describe('DetalheContratoComponent', () => {
  let fixture: ComponentFixture<DetalheContratoComponent>;
  let component: DetalheContratoComponent;

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const dashboardServiceMock = {
    buscarContratoPorNumero: jasmine.createSpy('buscarContratoPorNumero').and.returnValue(
      of({ numero: '10', cliente: 'Maria', cpfCnpj: '123', produto: 'Emprestimo', valorDevido: 1000, dataVencimento: '', status: 'INADIMPLENTE' }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheContratoComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ numero: '10' })) },
        },
        { provide: AcompanhamentoDashboardService, useValue: dashboardServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve navegar para renegociação com query param', () => {
    component.iniciarRenegociacao();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao'], {
      queryParams: { contrato: '10' },
    });
  });

  it('deve navegar para acompanhamento ao voltar', () => {
    component.voltar();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/acompanhamento']);
  });

  it('deve preencher erro ao falhar consulta', async () => {
    dashboardServiceMock.buscarContratoPorNumero.and.returnValue(
      throwError(() => new Error('Falha de API')),
    );

    await TestBed.resetTestingModule();
  });
});
