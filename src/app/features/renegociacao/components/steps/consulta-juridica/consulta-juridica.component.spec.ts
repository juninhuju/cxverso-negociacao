import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { ConsultaJuridicaComponent } from './consulta-juridica.component';
import { RenegociacaoFacade } from '../../../../../states/renegociacao/renegociacao.facade';

describe('ConsultaJuridicaComponent', () => {
  const contratoMock = {
    numero: '1001',
    cliente: 'Cliente Teste',
    cpfCnpj: '12345678901',
    produto: 'CDC',
    valorDevido: 10000,
    dataVencimento: '2026-01-01',
    status: 'APTO' as const,
  };

  const facadeMock = {
    loading: () => false,
    error: () => null,
    contrato: () => contratoMock,
    consultaJuridica: () => null,
    solicitarConsultaJuridica: jasmine.createSpy('solicitarConsultaJuridica'),
  };

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    facadeMock.solicitarConsultaJuridica.calls.reset();
    dialogRefMock.close.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ConsultaJuridicaComponent],
      providers: [
        { provide: RenegociacaoFacade, useValue: facadeMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            contrato: contratoMock,
            nomeAnalista: 'Ana Silva',
            matriculaAnalista: 'C123456',
          },
        },
      ],
    })
      .overrideComponent(ConsultaJuridicaComponent, { set: { template: '' } })
      .compileComponents();
  });

  it('deve solicitar consulta juridica e montar texto de email ao inicializar', () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(facadeMock.solicitarConsultaJuridica).toHaveBeenCalledWith('1001');
    expect(component.emailTexto).toContain('Contrato: 1001');
    expect(component.emailTexto).toContain('Ana Silva (C123456)');
  });

  it('deve alternar modo de edicao e avisos', () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    component.alternarEdicao();
    expect(component.modoEdicao).toBeTrue();
    expect(component.aviso).toContain('edição habilitado');

    component.alternarEdicao();
    expect(component.modoEdicao).toBeFalse();
    expect(component.aviso).toContain('Texto atualizado');
  });

  it('deve fechar dialog ao chamar fechar', () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    component.fechar();

    expect(dialogRefMock.close).toHaveBeenCalledWith('voltar');
  });

  it('deve enviar consulta e fechar dialog com continuar', () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    component.enviarConsulta();

    expect(component.aviso).toContain('Consulta enviada com sucesso');
    expect(dialogRefMock.close).toHaveBeenCalledWith('continuar');
  });

  it('deve copiar texto com sucesso quando clipboard estiver disponível', async () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;
    component.emailTexto = 'texto teste';

    const writeTextSpy = jasmine.createSpy('writeText').and.resolveTo();
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue(
      { writeText: writeTextSpy } as unknown as Clipboard,
    );

    await component.copiarTexto();

    expect(writeTextSpy).toHaveBeenCalledWith('texto teste');
    expect(component.aviso).toContain('Texto copiado');
  });

  it('deve informar erro quando cópia falhar', async () => {
    const fixture = TestBed.createComponent(ConsultaJuridicaComponent);
    const component = fixture.componentInstance;

    const writeTextSpy = jasmine.createSpy('writeText').and.rejectWith(new Error('falha'));
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue(
      { writeText: writeTextSpy } as unknown as Clipboard,
    );

    await component.copiarTexto();

    expect(component.aviso).toContain('Nao foi possivel copiar');
  });
});
