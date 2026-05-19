import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';
import { BuscaContratoComponent } from './busca-contrato.component';

describe('BuscaContratoComponent', () => {
  const errorSignal = signal<string | null>(null);
  const contratoSignal = signal<{
    numero: string;
    cliente: string;
    cpfCnpj: string;
    produto: string;
    valorDevido: number;
    dataVencimento: string;
    status: 'APTO';
  } | null>(null);

  const facadeMock = {
    loading: () => false,
    error: errorSignal,
    contrato: contratoSignal,
    reiniciarSessao: jasmine.createSpy('reiniciarSessao'),
    buscarContrato: jasmine.createSpy('buscarContrato'),
    avancarStep: jasmine.createSpy('avancarStep'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    facadeMock.buscarContrato.calls.reset();
    facadeMock.avancarStep.calls.reset();
    facadeMock.reiniciarSessao.calls.reset();
    routerMock.navigate.calls.reset();
    errorSignal.set(null);
    contratoSignal.set(null);

    await TestBed.configureTestingModule({
      imports: [BuscaContratoComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  it('deve calcular máscara vazia para até 9 dígitos', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('123456789');

    expect(component.mascaraDocumento()).toBe('');
  });

  it('deve calcular máscara CPF para até 11 dígitos', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('12345678901');

    expect(component.mascaraDocumento()).toBe('000.000.000-00');
  });

  it('deve calcular máscara CNPJ para mais de 11 dígitos', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('12345678901234');

    expect(component.mascaraDocumento()).toBe('00.000.000/0000-00');
  });

  it('não deve buscar com termo vazio', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('   ');
    component.buscar();

    expect(facadeMock.buscarContrato).not.toHaveBeenCalled();
    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve disparar busca via facade', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange(' 123 ');
    component.buscar();

    expect(facadeMock.buscarContrato).toHaveBeenCalledWith('123');
    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve reiniciar sessão ao inicializar componente', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    fixture.detectChanges();

    expect(facadeMock.reiniciarSessao).toHaveBeenCalled();
  });

  it('deve persistir termo de busca no localStorage', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('123.456.789-01');

    expect(localStorage.getItem('renegociacao_cpf_busca')).toBe('123.456.789-01');
  });

  it('deve avançar quando retorno de contrato corresponder ao termo', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('123');
    component.buscar();
    contratoSignal.set({
      numero: '123',
      cliente: 'A',
      cpfCnpj: '11111111111',
      produto: 'CDC',
      valorDevido: 10,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    });
    fixture.detectChanges();

    expect(facadeMock.avancarStep).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/renegociacao/selecionar']);
  });

  it('não deve avançar quando contrato não corresponder ao termo', () => {
    const fixture = TestBed.createComponent(BuscaContratoComponent);
    const component = fixture.componentInstance;

    component.onTermoBuscaChange('777');
    component.buscar();
    contratoSignal.set({
      numero: '123',
      cliente: 'A',
      cpfCnpj: '11111111111',
      produto: 'CDC',
      valorDevido: 10,
      dataVencimento: '2026-01-01',
      status: 'APTO',
    });
    fixture.detectChanges();

    expect(facadeMock.avancarStep).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve exibir e limpar erro temporário quando facade retornar erro', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(BuscaContratoComponent);
      const component = fixture.componentInstance;

      component.onTermoBuscaChange('123');
      component.buscar();
      errorSignal.set('falha');
      fixture.detectChanges();

      expect(component.erroSync()).toBe('Contrato não encontrado');
      jasmine.clock().tick(3000);
      expect(component.erroSync()).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
