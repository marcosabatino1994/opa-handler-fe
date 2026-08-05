import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthzResponse {
  result: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthzService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/authz';

  check(user: string, action: string, resource: string): Observable<AuthzResponse> {
    const params = new HttpParams()
      .set('user', user)
      .set('action', action)
      .set('resource', resource);
    return this.http.get<AuthzResponse>(this.baseUrl, { params });
  }
}
