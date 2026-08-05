import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'rbac-current-user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  // segnale reattivo: null = nessuno loggato
  readonly currentUser = signal<string | null>(localStorage.getItem(STORAGE_KEY));

  login(username: string): void {
    this.currentUser.set(username);
    localStorage.setItem(STORAGE_KEY, username);
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }
}
