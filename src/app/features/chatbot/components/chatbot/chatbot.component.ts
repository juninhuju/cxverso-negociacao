import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

type Role = 'user' | 'bot';

interface Message {
  id: string;
  role: Role;
  texto: string;
  hora: string;
}

interface Conversation {
  id: string;
  titulo: string;
  mensagens: Message[];
}

interface LegacyMessage {
  id?: unknown;
  role?: unknown;
  texto?: unknown;
  text?: unknown;
  content?: unknown;
  hora?: unknown;
  time?: unknown;
}

interface LegacyConversation {
  id?: unknown;
  titulo?: unknown;
  title?: unknown;
  mensagens?: unknown;
  messages?: unknown;
}

const STORAGE = 'chat_local';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {

  // ✅ evita null no value
  mensagem = new FormControl<string>('', { nonNullable: true });

  private _conversas = signal<Conversation[]>(this.load());
  conversas = this._conversas.asReadonly();

  conversaAtivaId = signal<string | null>(null);

  conversaAtiva = computed(() =>
    this.conversas().find(c => c.id === this.conversaAtivaId()) || null
  );

  constructor() {
    const lista = this._conversas();
    if (lista.length === 0) {
      const id = this.novaConversa();
      this.conversaAtivaId.set(id);
    } else {
      this.conversaAtivaId.set(lista[0].id);
    }
  }

  enviarMensagem(event?: Event) {
    event?.preventDefault();

    const texto = this.mensagem.value.trim();
    if (!texto) return;

    // ✅ garante um id ativo sempre válido
    let idAtivo = this.conversaAtivaId();
    if (!idAtivo) {
      idAtivo = this.novaConversa();
    }

    const userMsg: Message = {
      id: this.uid(),
      role: 'user',
      texto,
      hora: this.hora()
    };

    const botMsg: Message = {
      id: this.uid(),
      role: 'bot',
      texto: 'Aqui você terá suporte para renegociações (regras, documentos e próximos passos). Módulo em construção.',
      hora: this.hora()
    };

    // ✅ Atualiza e já persiste o MESMO estado (next)
    this._conversas.update((lista) => {
      // fallback: se por algum motivo idAtivo não existir na lista
      const existe = lista.some(c => c.id === idAtivo);
      const listaBase = existe ? lista : [{ id: idAtivo!, titulo: 'Nova conversa', mensagens: [] }, ...lista];

      const next = listaBase.map(c =>
        c.id === idAtivo
          ? {
              ...c,
              mensagens: [...(Array.isArray(c.mensagens) ? c.mensagens : []), userMsg, botMsg],
              titulo: c.titulo === 'Nova conversa'
                ? texto.slice(0, 25)
                : c.titulo
            }
          : c
      );

      this.saveState(next); // ✅ salva exatamente o que vai virar state
      return next;
    });

    this.conversaAtivaId.set(idAtivo);
    this.mensagem.setValue('');
  }

  novaConversa(): string {
    const nova: Conversation = {
      id: this.uid(),
      titulo: 'Nova conversa',
      mensagens: []
    };

    this._conversas.update((lista) => {
      const next = [nova, ...lista];
      this.saveState(next);
      return next;
    });

    this.conversaAtivaId.set(nova.id);
    return nova.id;
  }

  abrirConversa(id: string) {
    this.conversaAtivaId.set(id);
  }

  private saveState(state: Conversation[]) {
    try {
      const storage = this.getStorage();
      storage?.setItem(STORAGE, JSON.stringify(state));
    } catch {
      // ambiente pode restringir storage; ignora silenciosamente
    }
  }

  load(): Conversation[] {
    try {
      const storage = this.getStorage();
      const data = storage?.getItem(STORAGE);
      if (!data) {
        return [];
      }

      const parsed: unknown = JSON.parse(data);
      return this.normalizeConversations(parsed);
    } catch {
      return [];
    }
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    return window.localStorage;
  }

  private normalizeConversations(data: unknown): Conversation[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item): Conversation | null => {
        const conv = item as LegacyConversation;
        const id = typeof conv.id === 'string' && conv.id.trim().length > 0
          ? conv.id
          : this.uid();

        const tituloRaw = typeof conv.titulo === 'string'
          ? conv.titulo
          : typeof conv.title === 'string'
            ? conv.title
            : 'Nova conversa';

        const mensagensRaw = Array.isArray(conv.mensagens)
          ? conv.mensagens
          : Array.isArray(conv.messages)
            ? conv.messages
            : [];

        const mensagens = mensagensRaw
          .map((msg): Message | null => {
            const legacyMsg = msg as LegacyMessage;
            const role: Role = legacyMsg.role === 'user' ? 'user' : 'bot';

            const textoRaw = typeof legacyMsg.texto === 'string'
              ? legacyMsg.texto
              : typeof legacyMsg.text === 'string'
                ? legacyMsg.text
                : typeof legacyMsg.content === 'string'
                  ? legacyMsg.content
                  : '';

            if (textoRaw.trim().length === 0) {
              return null;
            }

            const horaRaw = typeof legacyMsg.hora === 'string'
              ? legacyMsg.hora
              : typeof legacyMsg.time === 'string'
                ? legacyMsg.time
                : this.hora();

            return {
              id: typeof legacyMsg.id === 'string' && legacyMsg.id.trim().length > 0
                ? legacyMsg.id
                : this.uid(),
              role,
              texto: textoRaw,
              hora: horaRaw,
            };
          })
          .filter((msg): msg is Message => msg !== null);

        return {
          id,
          titulo: tituloRaw.trim().length > 0 ? tituloRaw : 'Nova conversa',
          mensagens,
        };
      })
      .filter((conv): conv is Conversation => conv !== null);
  }

  uid() {
    return Math.random().toString(36).substring(2);
  }

  hora() {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
