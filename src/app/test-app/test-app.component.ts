import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteService } from '../services/route.service';
import { AuthzService } from '../services/authz.service';
import { SessionService } from '../services/session.service';
import { Route, RouteRequest } from '../models/route';

interface RouteView extends Route {
  can: { modify: boolean; approve: boolean; reject: boolean; delete: boolean };
}

@Component({
  selector: 'app-test-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-app.component.html',
  styleUrl: './test-app.component.css',
})
export class TestAppComponent implements OnInit {
  private routeService = inject(RouteService);
  private authz = inject(AuthzService);
  private session = inject(SessionService);
  private router = inject(Router);

  currentUser = this.session.currentUser()!;
  routes: RouteView[] = [];
  canCreate = false;
  loading = true;
  error = '';

  showForm = false;
  editingId: number | null = null;
  form = { origin: '', destination: '', modes: '' };

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.cancelForm();

    // pulsante "Nuova tratta": create non dipende dallo stato
    this.authz.check(this.currentUser, 'create', 'tratta').subscribe({
      next: (r) => (this.canCreate = r.result),
      error: () => (this.canCreate = false),
    });

    this.routeService.list().subscribe({
      next: (routes) => this.evaluate(routes),
      error: (err) => { this.error = 'Errore nel caricare le tratte: ' + err.message; this.loading = false; },
    });
  }

  // per ogni tratta chiede a OPA le azioni rilevanti, passando lo STATO
  private evaluate(routes: Route[]): void {
    if (!routes.length) { this.routes = []; this.loading = false; return; }

    const rows = routes.map((r) =>
      forkJoin({
        read:    this.authz.check(this.currentUser, 'read',    'tratta', r.status),
        modify:  this.authz.check(this.currentUser, 'modify',  'tratta', r.status),
        approve: this.authz.check(this.currentUser, 'approve', 'tratta', r.status),
        reject:  this.authz.check(this.currentUser, 'reject',  'tratta', r.status),
        del:     this.authz.check(this.currentUser, 'delete',  'tratta', r.status),
      }).pipe(
        map((d) => ({
          canRead: d.read.result,
          view: { ...r, can: {
            modify: d.modify.result, approve: d.approve.result,
            reject: d.reject.result, delete: d.del.result,
          }} as RouteView,
        }))
      )
    );

    forkJoin(rows).subscribe({
      next: (res) => {
        // mostro SOLO le tratte leggibili -> è OPA a filtrare (il viewer vede solo le approvate)
        this.routes = res.filter((x) => x.canRead).map((x) => x.view);
        this.loading = false;
      },
      error: (err) => { this.error = 'Errore nel valutare i permessi: ' + err.message; this.loading = false; },
    });
  }

  openCreate(): void { this.editingId = null; this.form = { origin: '', destination: '', modes: '' }; this.showForm = true; }
  openEdit(r: RouteView): void { this.editingId = r.id!; this.form = { origin: r.origin, destination: r.destination, modes: r.modes.join(', ') }; this.showForm = true; }
  cancelForm(): void { this.showForm = false; this.editingId = null; }

  submitForm(): void {
    const req: RouteRequest = {
      origin: this.form.origin.trim(),
      destination: this.form.destination.trim(),
      modes: this.form.modes.split(',').map((m) => m.trim()).filter(Boolean),
    };
    if (!req.origin || !req.destination) { this.error = 'Origine e destinazione sono obbligatorie.'; return; }
    const op = this.editingId == null
      ? this.routeService.create(req)
      : this.routeService.update(this.editingId, req);
    op.subscribe({ next: () => this.refresh(), error: (err) => (this.error = 'Errore salvataggio: ' + err.message) });
  }

  approve(r: RouteView): void { this.routeService.approve(r.id!).subscribe({ next: () => this.refresh(), error: (e) => (this.error = 'Errore approvazione: ' + e.message) }); }
  reject(r: RouteView): void { this.routeService.reject(r.id!).subscribe({ next: () => this.refresh(), error: (e) => (this.error = 'Errore rifiuto: ' + e.message) }); }
  remove(r: RouteView): void {
    if (!confirm(`Eliminare la tratta ${r.origin} → ${r.destination}?`)) return;
    this.routeService.delete(r.id!).subscribe({ next: () => this.refresh(), error: (e) => (this.error = 'Errore eliminazione: ' + e.message) });
  }

  logout(): void { this.session.logout(); this.router.navigate(['/login']); }

  statusLabel(s: string): string {
    return s === 'IN_REVISIONE' ? 'In revisione' : s === 'APPROVATA' ? 'Approvata' : 'Rifiutata';
  }
}
