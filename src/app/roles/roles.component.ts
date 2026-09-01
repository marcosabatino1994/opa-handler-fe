import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../services/role.service';
import { PermissionService } from '../services/permission.service';
import { Role, RoleRequest } from '../models/role';
import { Permission } from '../models/permission';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);

  roles: Role[] = [];
  permissions: Permission[] = [];
  newName = '';
  selectedIds = new Set<number>();
  error = '';

  editingId: number | null = null;
  editingPermIds = new Set<number>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.roleService.list().subscribe({
      next: (data) => (this.roles = data),
      error: (err) => (this.error = 'Errore caricamento ruoli: ' + err.message),
    });
    this.permissionService.list().subscribe({
      next: (data) => (this.permissions = data),
      error: (err) => (this.error = 'Errore caricamento permessi: ' + err.message),
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
    if (!this.newName.trim()) return;
    const req: RoleRequest = {
      name: this.newName.trim(),
      permissionIds: Array.from(this.selectedIds),
    };
    this.roleService.create(req).subscribe({
      next: () => {
        this.newName = '';
        this.selectedIds.clear();
        this.load();
      },
      error: (err) => (this.error = 'Errore creazione ruolo: ' + err.message),
    });
  }

  startEdit(role: Role): void {
    this.editingId = role.id ?? null;
    this.editingPermIds = new Set(role.permissions.map(p => p.id).filter((id): id is number => id != null));
  }

  toggleEdit(id: number | undefined): void {
    if (id == null) return;
    this.editingPermIds.has(id) ? this.editingPermIds.delete(id) : this.editingPermIds.add(id);
  }

  isEditSelected(id: number | undefined): boolean {
    return id != null && this.editingPermIds.has(id);
  }

  saveEdit(role: Role): void {
    if (role.id == null) return;
    const req: RoleRequest = {
      name: role.name,
      permissionIds: Array.from(this.editingPermIds),
    };
    this.roleService.update(role.id, req).subscribe({
      next: () => {
        this.editingId = null;
        this.editingPermIds.clear();
        this.load();
      },
      error: (err) => (this.error = 'Errore aggiornamento permessi: ' + err.message),
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingPermIds.clear();
  }

  remove(id: number | undefined): void {
    if (id == null) return;
    this.roleService.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = 'Errore eliminazione: ' + err.message),
    });
  }
}
