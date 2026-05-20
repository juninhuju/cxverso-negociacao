import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;

  beforeEach(async () => {
    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key in store) {
          delete store[key];
        }
      },
      length: 0,
      key: () => null,
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [ChatbotComponent, ReactiveFormsModule, MatIconModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  // ===================== TESTES BÁSICOS =====================

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar com campo de mensagem vazio', () => {
    expect(component.mensagem.value).toBe('');
  });

  it('deve inicializar com primeira conversa automaticamente', (done) => {
    setTimeout(() => {
      expect(component.conversas().length).toBeGreaterThan(0);
      expect(component.conversaAtivaId()).toBeDefined();
      done();
    }, 0);
  });

  // ===================== TESTES DE ENVIO DE MENSAGEM =====================

  it('deve enviar mensagem do usuário', () => {
    component.mensagem.setValue('Olá chatbot');
    component.enviarMensagem();

    const conversa = component.conversaAtiva();
    expect(conversa?.mensagens.length).toBeGreaterThan(0);
    expect(conversa?.mensagens[0].role).toBe('user');
    expect(conversa?.mensagens[0].texto).toBe('Olá chatbot');
  });

  it('deve responder com mensagem do bot após envio do usuário', () => {
    component.mensagem.setValue('Como funciona?');
    component.enviarMensagem();

    const conversa = component.conversaAtiva();
    expect(conversa?.mensagens.length).toBe(2); // User + Bot
    expect(conversa?.mensagens[1].role).toBe('bot');
    expect(conversa?.mensagens[1].texto).toContain('construção');
  });

  it('não deve enviar mensagem vazia', () => {
    const mensagensAntigo = component.conversaAtiva()?.mensagens.length ?? 0;

    component.mensagem.setValue('');
    component.enviarMensagem();

    expect(component.conversaAtiva()?.mensagens.length).toBe(mensagensAntigo);
  });

  it('não deve enviar mensagem com apenas espaços', () => {
    const mensagensAntigo = component.conversaAtiva()?.mensagens.length ?? 0;

    component.mensagem.setValue('   ');
    component.enviarMensagem();

    expect(component.conversaAtiva()?.mensagens.length).toBe(mensagensAntigo);
  });

  it('deve limpar o campo de mensagem após envio', () => {
    component.mensagem.setValue('Teste');
    component.enviarMensagem();

    expect(component.mensagem.value).toBe('');
  });

  it('deve atualizar o título da conversa com primeira mensagem', () => {
    const conversa = component.conversaAtiva();
    expect(conversa).toBeTruthy();

    component.mensagem.setValue('Nova mensagem importante');
    component.enviarMensagem();

    const conversaAtualizada = component.conversaAtiva();
    expect(conversaAtualizada?.titulo).not.toBe('Nova conversa');
    expect(conversaAtualizada?.titulo).toContain('Nova mensagem');
  });

  it('deve truncar título da conversa em 25 caracteres', () => {
    const textoLongo = 'A'.repeat(50);
    component.mensagem.setValue(textoLongo);
    component.enviarMensagem();

    const conversaAtualizada = component.conversaAtiva();
    expect(conversaAtualizada?.titulo.length).toBe(25);
  });

  // ===================== TESTES DE NOVA CONVERSA =====================

  it('deve criar nova conversa', () => {
    const conversasAntigo = component.conversas().length;

    const novoId = component.novaConversa();

    expect(component.conversas().length).toBe(conversasAntigo + 1);
    expect(novoId).toBeDefined();
    expect(component.conversaAtivaId()).toBe(novoId);
  });

  it('deve criar nova conversa com título padrão', () => {
    const novoId = component.novaConversa();
    const conversa = component.conversas().find(c => c.id === novoId);

    expect(conversa?.titulo).toBe('Nova conversa');
  });

  it('deve inicializar nova conversa com mensagens vazias', () => {
    const novoId = component.novaConversa();
    const conversa = component.conversas().find(c => c.id === novoId);

    expect(conversa?.mensagens.length).toBe(0);
  });

  // ===================== TESTES DE ABRIR CONVERSA =====================

  it('deve mudar para conversa selecionada', () => {
    component.novaConversa();
    component.novaConversa();
    const conversas = component.conversas();
    const conversa2Id = conversas[1].id;

    component.abrirConversa(conversa2Id);

    expect(component.conversaAtivaId()).toBe(conversa2Id);
  });

  it('deve manter o histórico ao trocar de conversa', () => {
    // Adiciona mensagem na primeira conversa
    component.mensagem.setValue('Mensagem 1');
    component.enviarMensagem();

    const conversa1 = component.conversaAtiva();
    const mensagensCov1 = conversa1?.mensagens.length ?? 0;

    // Cria nova conversa
    component.novaConversa();

    // Adiciona mensagem na segunda conversa
    component.mensagem.setValue('Mensagem 2');
    component.enviarMensagem();

    // Volta para primeira conversa
    component.abrirConversa(conversa1!.id);

    expect(component.conversaAtiva()?.mensagens.length).toBe(mensagensCov1);
  });

  // ===================== TESTES DE STORAGE =====================

  it('deve persistir conversas no localStorage', () => {
    component.mensagem.setValue('Teste persistência');
    component.enviarMensagem();

    const dataSalva = JSON.parse(
      window.localStorage.getItem('chat_local') || '[]'
    );

    expect(dataSalva.length).toBeGreaterThan(0);
    expect(dataSalva[0].mensagens[0].texto).toBe('Teste persistência');
  });

  it('deve recuperar conversas do localStorage ao criar novo componente', () => {
    // Salva dados no storage
    component.mensagem.setValue('Mensagem persistida');
    component.enviarMensagem();

    // Cria novo componente
    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;
    fixture2.detectChanges();

    const conversasRecuperadas = component2.conversas();
    expect(conversasRecuperadas.length).toBeGreaterThan(0);
    expect(conversasRecuperadas[0].mensagens[0].texto).toBe('Mensagem persistida');
  });

  it('deve inicializar com lista vazia se localStorage estiver corrompido', () => {
    window.localStorage.setItem('chat_local', 'dados inválidos');

    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;
    fixture2.detectChanges();

    // Deve criar primeira conversa automaticamente
    expect(component2.conversas().length).toBeGreaterThan(0);
  });

  it('deve ignorar erro de localStorage indisponível', () => {
    const mockStorageError = {
      getItem: () => {
        throw new Error('Storage não disponível');
      },
      setItem: () => {
        throw new Error('Storage não disponível');
      },
      removeItem: () => {
        return;
      },
      clear: () => {
        return;
      },
      length: 0,
      key: () => null,
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorageError,
      writable: true,
    });

    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;
    fixture2.detectChanges();

    // Não deve lançar erro, deve initializar vazio
    expect(component2.conversas().length).toBeGreaterThan(0);
  });

  // ===================== TESTES DE UTILITÁRIOS =====================

  it('deve gerar IDs únicos', () => {
    const id1 = component['uid']();
    const id2 = component['uid']();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('deve gerar hora em formato pt-BR', () => {
    const hora = component.hora();

    expect(hora).toMatch(/^\d{2}:\d{2}$/);
  });

  it('deve adicionar timestamps às mensagens', () => {
    component.mensagem.setValue('Mensagem com hora');
    component.enviarMensagem();

    const conversa = component.conversaAtiva();
    const primeiraMsg = conversa?.mensagens[0];

    expect(primeiraMsg?.hora).toMatch(/^\d{2}:\d{2}$/);
  });

  // ===================== TESTES DE NORMALIZAÇÃO (LEGACY) =====================

  it('deve normalizar conversa com campo "title" para "titulo"', () => {
    const dataLegacy = JSON.stringify([
      {
        id: 'test-1',
        title: 'Conversa antiga',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            text: 'Olá',
            time: '10:00',
          },
        ],
      },
    ]);

    window.localStorage.setItem('chat_local', dataLegacy);

    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;

    const conversa = component2.conversas()[0];
    expect(conversa.titulo).toBe('Conversa antiga');
    expect(conversa.mensagens[0].texto).toBe('Olá');
  });

  it('deve ignorar mensagens vazio durante normalização', () => {
    const dataWithEmpty = JSON.stringify([
      {
        id: 'test-1',
        titulo: 'Conversa',
        mensagens: [
          { id: 'msg-1', role: 'user', texto: 'Válida' },
          { id: 'msg-2', role: 'user', texto: '   ' }, // Vazia - deve ser removida
          { id: 'msg-3', role: 'bot', texto: 'Outra' },
        ],
      },
    ]);

    window.localStorage.setItem('chat_local', dataWithEmpty);

    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;

    expect(component2.conversas()[0].mensagens.length).toBe(2);
  });

  it('deve gerar IDs para mensagens sem ID válido', () => {
    const dataWithoutId = JSON.stringify([
      {
        id: 'test-1',
        titulo: 'Conversa',
        mensagens: [
          { role: 'user', texto: 'Sem ID' },
        ],
      },
    ]);

    window.localStorage.setItem('chat_local', dataWithoutId);

    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;

    const msg = component2.conversas()[0].mensagens[0];
    expect(msg.id).toBeDefined();
    expect(msg.id.length).toBeGreaterThan(0);
  });

  // ===================== TESTES DE FLUXO COMPLETO =====================

  it('deve manter histórico correto em múltiplas conversas', () => {
    // Conversa 1
    component.mensagem.setValue('Msg conversa 1');
    component.enviarMensagem();
    const conv1Id = component.conversaAtivaId();

    // Conversa 2
    component.novaConversa();
    component.mensagem.setValue('Msg conversa 2');
    component.enviarMensagem();
    const conv2Id = component.conversaAtivaId();

    // Voltar conversa 1
    component.abrirConversa(conv1Id!);
    expect(component.conversaAtiva()?.mensagens[0].texto).toContain('Msg conversa 1');

    // Voltar conversa 2
    component.abrirConversa(conv2Id!);
    expect(component.conversaAtiva()?.mensagens[0].texto).toContain('Msg conversa 2');
  });

  it('deve criar primeira conversa automaticamente se lista estiver vazia', (done) => {
    window.localStorage.clear();

    const fixture2 = TestBed.createComponent(ChatbotComponent);
    const component2 = fixture2.componentInstance;
    fixture2.detectChanges();

    setTimeout(() => {
      expect(component2.conversas().length).toBeGreaterThan(0);
      expect(component2.conversaAtivaId()).toBeDefined();
      done();
    }, 0);
  });

  it('deve permitir múltiplas mensagens na mesma conversa', () => {
    component.mensagem.setValue('Mensagem 1');
    component.enviarMensagem();

    component.mensagem.setValue('Mensagem 2');
    component.enviarMensagem();

    component.mensagem.setValue('Mensagem 3');
    component.enviarMensagem();

    const conversa = component.conversaAtiva();
    // 3 user messages + 3 bot messages = 6
    expect(conversa?.mensagens.length).toBe(6);
  });

  it('deve garantir ID ativo válido ao enviar mensagem', () => {
    component.conversaAtivaId.set(null);

    component.mensagem.setValue('Teste com ID nulo');
    component.enviarMensagem();

    // Deve ter criado conversa e atribuído ID
    expect(component.conversaAtivaId()).toBeDefined();
    expect(component.conversaAtiva()?.mensagens.length).toBeGreaterThan(0);
  });

  it('deve resetar conversa inexistente ao enviar mensagem', () => {
    const conversasOriginais = component.conversas().length;

    // Define um ID que não existe
    component.conversaAtivaId.set('id-inexistente');

    component.mensagem.setValue('Mensagem');
    component.enviarMensagem();

    // Deve criar nova conversa automaticamente
    expect(component.conversas().length).toBeGreaterThan(conversasOriginais);
  });

  // ===================== TESTES DE SIGNALS =====================

  it('deve atualizar conversas signal corretamente', () => {
    const conversasIniciais = component.conversas();

    component.novaConversa();

    const conversasAtualizadas = component.conversas();
    expect(conversasAtualizadas.length).toBe(conversasIniciais.length + 1);
  });

  it('conversaAtiva deve retornar conversa correta baseada em conversaAtivaId', () => {
    const conv1 = component.conversaAtiva();

    component.novaConversa();
    const conv2 = component.conversaAtiva();

    component.abrirConversa(conv1!.id);
    expect(component.conversaAtiva()).toEqual(conv1);

    component.abrirConversa(conv2!.id);
    expect(component.conversaAtiva()).toEqual(conv2);
  });
});
