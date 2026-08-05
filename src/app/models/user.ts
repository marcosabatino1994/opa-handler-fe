import { Role } from './role';

// forma restituita da GET /users
export interface AppUser {
  id?: number;
  username: string;
  roles: Role[];
}

// forma attesa da POST /users
export interface UserRequest {
  username: string;
  roleIds: number[];
}
