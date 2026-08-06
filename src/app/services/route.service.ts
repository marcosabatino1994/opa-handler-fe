import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route, RouteRequest } from '../models/route';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/routes';

  list(): Observable<Route[]> {
    return this.http.get<Route[]>(this.baseUrl);
  }
  create(req: RouteRequest): Observable<Route> {
    return this.http.post<Route>(this.baseUrl, req);
  }
  update(id: number, req: RouteRequest): Observable<Route> {
    return this.http.put<Route>(`${this.baseUrl}/${id}`, req);
  }
  approve(id: number): Observable<Route> {
    return this.http.post<Route>(`${this.baseUrl}/${id}/approve`, {});
  }
  reject(id: number): Observable<Route> {
    return this.http.post<Route>(`${this.baseUrl}/${id}/reject`, {});
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
