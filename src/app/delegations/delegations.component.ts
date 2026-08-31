import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DelegationService } from '../services/delegation.service';
import { UserService } from '../services/user.service';
import { PermissionService } from '../services/permission.service';
import { Delegation } from '../models/delegation';
import { AppUser } from '../models/user';
import { Permission } from '../models/permission';

@Component({
  selector: 'app-delegations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delegations.component.html',
  styleUrl: './delegations.component.css'
})
export class DelegationsComponent implements OnInit {
  private delegationService = inject(DelegationService);
  private userService = inject(UserService);
  private permissionService = inject(PermissionService);

  delegations: Delegation[] = [];
  users: AppUser[] = [];
  permissions: Permission[] = [];
  uniqueResources: string[] = [];

  fromUser = '';
  toUser = '';
  action = '';
  resource = '';
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.delegationService.list().subscribe({ next: d => (this.delegations = d) });
    this.userService.list().subscribe({ next: u => (this.users = u) });
    this.permissionService.list().subscribe({ next: p => {
      this.permissions = p;
      this.uniqueResources = [...new Set(p.map(x => x.resource))];
    }});
  }

  create(): void {
    if (!this.fromUser || !this.toUser || !this.action || !this.resource) {
      this.error = 'Tutti i campi sono obbligatori';
      return;
    }
    if (this.fromUser === this.toUser) {
      this.error = 'fromUser e toUser non possono essere uguali';
      return;
    }
    this.error = '';
    this.delegationService.create({
      fromUser: this.fromUser,
      toUser: this.toUser,
      action: this.action,
      resource: this.resource
    }).subscribe({
      next: () => {
        this.fromUser = '';
        this.toUser = '';
        this.action = '';
        this.resource = '';
        this.load();
      },
      error: err => (this.error = err.error?.message ?? err.message)
    });
  }

  remove(id: number | undefined): void {
    if (id == null) return;
    this.delegationService.delete(id).subscribe({
      next: () => this.load(),
      error: err => (this.error = err.error?.message ?? err.message)
    });
  }
}
