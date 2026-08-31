import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delegation, DelegationRequest } from '../models/delegation';

@Injectable({ providedIn: 'root' })
export class DelegationService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/delegations';

  list(): Observable<Delegation[]> {
    return this.http.get<Delegation[]>(this.baseUrl);
  }

  create(req: DelegationRequest): Observable<Delegation> {
    return this.http.post<Delegation>(this.baseUrl, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
