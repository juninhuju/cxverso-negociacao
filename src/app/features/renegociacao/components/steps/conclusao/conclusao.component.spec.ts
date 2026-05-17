import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { ConclusaoComponent } from './conclusao.component';

describe('ConclusaoComponent', () => {
  const facadeMock = {
    resultado: () => null,
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
});
