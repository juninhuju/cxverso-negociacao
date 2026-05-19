/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConclusaoComponent } from './conclusao.component';

describe('ConclusaoComponent', () => {
  const facadeMock = {
    resultado: () => null,
    stepAtual: () => 0,
    loading: () => false,
    reiniciarSessao: jasmine.createSpy('reiniciarSessao'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };


  beforeEach(async () => {
    facadeMock.reiniciarSessao.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ConclusaoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });


  it('deve reiniciar sessão e navegar para busca ao concluir', () => {
    const fixture = TestBed.createComponent(ConclusaoComponent);
    const component = fixture.componentInstance;

    component.concluir();

    expect(facadeMock.reiniciarSessao).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/busca']);
  });


  it('deve exibir barra de sucesso ao gerar contrato e navegar/resetar após delay', () => {
    jasmine.clock().install();
    const fixture = TestBed.createComponent(ConclusaoComponent);
    const component = fixture.componentInstance;

    component.gerarContratoEBoleto();
    expect(component.sucessoBarraVisivel).toBeTrue();
    // Antes do timeout, não deve navegar nem resetar
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(facadeMock.reiniciarSessao).not.toHaveBeenCalled();

    // Avança o tempo para disparar navegação/reset (3s)
    jasmine.clock().tick(3000);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/busca']);
    expect(facadeMock.reiniciarSessao).toHaveBeenCalled();

    // Avança o tempo para esconder a barra (6s total)
    jasmine.clock().tick(3000);
    expect(component.sucessoBarraVisivel).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('deve navegar para acompanhamento no verPainel', () => {
    const fixture = TestBed.createComponent(ConclusaoComponent);
    const component = fixture.componentInstance;

    component.verPainel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/acompanhamento']);
  });
});
