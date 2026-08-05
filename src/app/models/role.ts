import { Permission } from './permission';

// forma restituita da GET /roles
export interface Role {
  id?: number;
  name: string;
  permissions: Permission[];
}

// forma attesa da POST /roles
export interface RoleRequest {
  name: string;
  permissionIds: number[];
}
