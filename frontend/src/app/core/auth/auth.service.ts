import { computed, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';
const TOKEN_TTL_SECONDS = 60 * 60;

interface MockTokenPayload {
  readonly sub: string;
  readonly iat: number;
  readonly exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _username = signal<string | null>(
    localStorage.getItem(STORAGE_KEY),
  );
  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  readonly isLoggedIn = computed(() => this.hasValidToken());
  readonly username = computed(() =>
    this.hasValidToken() ? (this._username() ?? '') : '',
  );

  getToken(): string {
    const token = this._token();
    return token && this.hasValidToken() ? token : '';
  }

  hasValidToken(): boolean {
    const token = this._token();
    if (!token || !this.isTokenWellFormed(token)) {
      return false;
    }

    const payload = this.parsePayload(token);
    if (!payload) {
      return false;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  }

  login(username: string, password: string): void {
    void password;
    const token = this.buildMockToken(username);
    localStorage.setItem(STORAGE_KEY, username);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this._username.set(username);
    this._token.set(token);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this._username.set(null);
    this._token.set(null);
  }

  private buildMockToken(username: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = this.base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = this.base64UrlEncode(JSON.stringify({
      sub: username,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    } satisfies MockTokenPayload));
    return `${header}.${payload}.mock-signature`;
  }

  private isTokenWellFormed(token: string): boolean {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
  }

  private parsePayload(token: string): MockTokenPayload | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);
      const bytes = Uint8Array.from(decoded, (ch) => ch.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(json) as Partial<MockTokenPayload>;
      if (
        typeof parsed.sub !== 'string' ||
        typeof parsed.iat !== 'number' ||
        typeof parsed.exp !== 'number'
      ) {
        return null;
      }
      return {
        sub: parsed.sub,
        iat: parsed.iat,
        exp: parsed.exp,
      };
    } catch {
      return null;
    }
  }

  private base64UrlEncode(value: string): string {
    const bytes = new TextEncoder().encode(value);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
}
