import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthzService } from '../services/authz.service';
import { UserService } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { AppUser } from '../models/user';

@Component({
  selector: 'app-test-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-app.component.html',
  styleUrl: './test-app.component.css',
})
export class TestAppComponent implements OnInit {
  private authz = inject(AuthzService);
  private userService = inject(UserService);
  private session = inject(SessionService);
  private router = inject(Router);

  currentUser = this.session.currentUser()!;   // garantito dalla guardia
  readonly action = 'delete';
  readonly resource = 'report';

  me: AppUser | null = null;   // i miei ruoli/permessi (dal DB)
  canDelete = false;           // la decisione di OPA
  loading = true;
  error = '';

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';

    // 1. Chi sono: ruoli e permessi come registrati nel database
    this.userService.list().subscribe({
      next: (users) => (this.me = users.find((u) => u.username === this.currentUser) ?? null),
      error: (err) => (this.error = 'Errore caricamento profilo: ' + err.message),
    });

    // 2. Cosa posso fare: la decisione live di OPA sul pulsante
    this.authz.check(this.currentUser, this.action, this.resource).subscribe({
      next: (res) => { this.canDelete = res.result; this.loading = false; },
      error: (err) => { this.error = 'Errore nel contattare OPA: ' + err.message; this.loading = false; },
    });
  }

  logout(): void {
    this.session.logout();
    this.router.navigate(['/login']);
  }

  onDelete(): void {
    alert('Report eliminato! (demo)');
  }
}
