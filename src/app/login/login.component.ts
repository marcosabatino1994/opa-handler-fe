import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { AppUser } from '../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private session = inject(SessionService);
  private router = inject(Router);

  users: AppUser[] = [];
  selected = '';
  error = '';

  ngOnInit(): void {
    this.userService.list().subscribe({
      next: (data) => (this.users = data),
      error: (err) => (this.error = 'Errore caricamento utenti: ' + err.message),
    });
  }

  login(): void {
    if (!this.selected) { this.error = 'Scegli un utente.'; return; }
    this.session.login(this.selected);
    this.router.navigate(['/test']);
  }
}
