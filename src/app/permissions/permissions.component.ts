import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../models/permission';


@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css',
})
export class PermissionsComponent implements OnInit {
  private service = inject(PermissionService);

  permissions: Permission[] = [];
  newPermission: Permission = { action: '', resource: '' };
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (data) => (this.permissions = data),
      error: (err) => (this.error = 'Errore nel caricamento: ' + err.message),
    });
  }

  create(): void {
    if (!this.newPermission.action || !this.newPermission.resource) return;
    this.service.create(this.newPermission).subscribe({
      next: () => {
        this.newPermission = { action: '', resource: '' }; // svuoto il form
        this.load();                                        // ricarico la lista
      },
      error: (err) => (this.error = 'Errore nella creazione: ' + err.message),
    });
  }

  remove(id: number | undefined): void {
    if (id == null) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = 'Errore nell\'eliminazione: ' + err.message),
    });
  }
}
