// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConclusaoComponent } from './conclusao.component';

describe('ConclusaoComponent', () => {
  let fixture: ComponentFixture<ConclusaoComponent>;
  let component: ConclusaoComponent;

  const facadeMock = {
    stepAtual: signal(6),
    loading: signal(false),
    reiniciarSessao: jasmine.createSpy('reiniciarSessao'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConclusaoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConclusaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir barra e navegar após gerar contrato e boleto', fakeAsync(() => {
    component.gerarContratoEBoleto();

    expect(component.sucessoBarraVisivel).toBeTrue();

    tick(3000);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/busca']);
    expect(facadeMock.reiniciarSessao).toHaveBeenCalled();

    tick(3000);
    expect(component.sucessoBarraVisivel).toBeFalse();
  }));

  it('deve navegar para acompanhamento ao ver painel', () => {
    component.verPainel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/acompanhamento']);
  });
});
