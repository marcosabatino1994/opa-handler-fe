import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser, UserRequest } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/users';

  list(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.baseUrl);
  }

  create(req: UserRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.baseUrl, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
