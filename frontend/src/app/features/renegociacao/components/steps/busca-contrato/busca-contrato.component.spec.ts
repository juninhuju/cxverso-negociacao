// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, jasmine: any, spyOn: any;
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { BuscaContratoComponent } from './busca-contrato.component';

describe('BuscaContratoComponent', () => {
  let fixture: ComponentFixture<BuscaContratoComponent>;
  let component: BuscaContratoComponent;

  const facadeMock = {
    loading: signal(false),
    error: signal<string | null>(null),
    contratos: signal<Array<{ numero: string; cpfCnpj: string }>>([]),
    reiniciarSessao: jasmine.createSpy('reiniciarSessao'),
    buscarContrato: jasmine.createSpy('buscarContrato'),
    avancarStep: jasmine.createSpy('avancarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BuscaContratoComponent],
      providers: [
        provideEnvironmentNgxMask(),
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscaContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente e reiniciar sessão na entrada', () => {
    expect(component).toBeTruthy();
    expect(facadeMock.reiniciarSessao).toHaveBeenCalled();
  });

  it('deve buscar contrato quando termo preenchido', () => {
    component.termoBusca.set('12345678901');

    component.buscar();

    expect(facadeMock.buscarContrato).toHaveBeenCalledWith('12345678901');
  });

  it('deve atualizar localStorage ao alterar termo de busca', () => {
    const setItemSpy = spyOn(localStorage, 'setItem');

    component.onTermoBuscaChange('11122233344');

    expect(component.termoBusca()).toBe('11122233344');
    expect(setItemSpy).toHaveBeenCalledWith('renegociacao_cpf_busca', '11122233344');
  });
});
