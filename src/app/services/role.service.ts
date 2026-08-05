import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, RoleRequest } from '../models/role';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/roles';

  list(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  create(req: RoleRequest): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
