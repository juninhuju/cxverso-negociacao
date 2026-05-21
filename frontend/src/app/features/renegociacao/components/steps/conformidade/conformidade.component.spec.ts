// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, afterEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { Contrato, SimulacaoRenegociacao } from '../../../models/renegociacao.model';
import { ConformidadeComponent } from './conformidade.component';

describe('ConformidadeComponent', () => {
  let fixture: ComponentFixture<ConformidadeComponent>;
  let component: ConformidadeComponent;

  const facadeMock = {
    loading: signal(false),
    contrato: signal<Contrato | null>(null),
    simulacao: signal<SimulacaoRenegociacao | null>(null),
    avancarStep: jasmine.createSpy('avancarStep'),
    voltarStep: jasmine.createSpy('voltarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConformidadeComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConformidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve concluir conformidade e navegar para conclusão', () => {
    component.concluirConformidade();

    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/conclusao']);
  });

  it('deve voltar para resultado', () => {
    component.voltar();

    expect(facadeMock.voltarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/resultado']);
  });
});
