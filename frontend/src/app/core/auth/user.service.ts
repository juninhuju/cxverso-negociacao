import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DadosUsuario } from '../models/dados-usuario';

const USER_STORAGE_KEY = 'negocia_caixa_usuario';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly userUrl = `${environment.bffUrl}/user`;

  readonly usuario = signal<DadosUsuario | null>(this.carregarDoStorage());

  carregarUsuario(matricula?: string): void {
    const url = matricula
      ? `${this.userUrl}?matricula=${encodeURIComponent(matricula)}`
      : this.userUrl;

    this.http
      .get<DadosUsuario>(url)
      .pipe(catchError(() => EMPTY))
      .subscribe((dados) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dados));
        this.usuario.set(dados);
      });
  }

  limpar(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    this.usuario.set(null);
  }

  private carregarDoStorage(): DadosUsuario | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DadosUsuario) : null;
    } catch {
      return null;
    }
  }
}
