export type RouteStatus = 'IN_REVISIONE' | 'APPROVATA' | 'RIFIUTATA';

export interface Route {
  id?: number;
  origin: string;
  destination: string;
  modes: string[];
  status: RouteStatus;
}

export interface RouteRequest {
  origin: string;
  destination: string;
  modes: string[];
}
