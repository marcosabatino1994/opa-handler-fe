import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { AppUser, UserRequest } from '../models/user';
import { Role } from '../models/role';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  users: AppUser[] = [];
  roles: Role[] = [];               // per le checkbox
  newUsername = '';
  selectedIds = new Set<number>();  // id dei ruoli spuntati
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.userService.list().subscribe({
      next: (data) => (this.users = data),
      error: (err) => (this.error = 'Errore caricamento utenti: ' + err.message),
    });
    this.roleService.list().subscribe({
      next: (data) => (this.roles = data),
      error: (err) => (this.error = 'Errore caricamento ruoli: ' + err.message),
    });
  }

  toggle(id: number | undefined): void {
    if (id == null) return;
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  isSelected(id: number | undefined): boolean {
    return id != null && this.selectedIds.has(id);
  }

  create(): void {
    if (!this.newUsername.trim()) return;
    const req: UserRequest = {
      username: this.newUsername.trim(),
      roleIds: Array.from(this.selectedIds),
    };
    this.userService.create(req).subscribe({
      next: () => {
        this.newUsername = '';
        this.selectedIds.clear();
        this.load();
      },
      error: (err) => (this.error = 'Errore creazione utente: ' + err.message),
    });
  }

  remove(id: number | undefined): void {
    if (id == null) return;
    this.userService.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = 'Errore eliminazione: ' + err.message),
    });
  }
}
