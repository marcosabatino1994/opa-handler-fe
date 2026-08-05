import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission } from '../models/permission';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/permissions';

  list(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.baseUrl);
  }

  create(p: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.baseUrl, p);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
