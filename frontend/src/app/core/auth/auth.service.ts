import { computed, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _username = signal<string | null>(
    localStorage.getItem(STORAGE_KEY),
  );

  readonly isLoggedIn = computed(() => this._username() !== null);
  readonly username = computed(() => this._username() ?? '');

  getToken(): string {
    const user = this._username();
    return user ? `mock-token-${user}` : '';
  }

  login(username: string, password: string): void {
    void password;
    localStorage.setItem(STORAGE_KEY, username);
    this._username.set(username);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._username.set(null);
  }
}
