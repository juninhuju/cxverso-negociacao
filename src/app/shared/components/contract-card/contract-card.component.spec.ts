import { TestBed } from '@angular/core/testing';
import { ContractCardComponent } from './contract-card.component';

describe('ContractCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractCardComponent],
    }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(ContractCardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('deve receber contrato via input', () => {
    const fixture = TestBed.createComponent(ContractCardComponent);
    const component = fixture.componentInstance;
    const contrato = {
      numero: '123',
      cliente: 'Joana',
      cpfCnpj: '12345678901',
      produto: 'CDC',
      valorDevido: 1000,
      dataVencimento: '2026-01-01',
      status: 'APTO' as const,
    };

    fixture.componentRef.setInput('contrato', contrato);
    fixture.detectChanges();

    expect(component.contrato()).toEqual(contrato);
  });
});
