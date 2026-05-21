// @ts-ignore
declare var describe: any, it: any, expect: any, beforeEach: any, jasmine: any;
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent', () => {
  let fixture: ComponentFixture<ChatbotComponent>;
  let component: ChatbotComponent;

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChatbotComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve criar nova conversa', () => {
    const id = component.novaConversa();
    expect(id).toBeTruthy();
    expect(component.conversas().length).toBeGreaterThan(0);
  });

  it('deve enviar mensagem na conversa ativa', () => {
    component.mensagem.setValue('Olá');

    component.enviarMensagem();

    const ativa = component.conversaAtiva();
    expect(ativa?.mensagens.length).toBe(2);
  });

  it('deve fechar diálogo quando solicitado', () => {
    component.fecharDialogo();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
