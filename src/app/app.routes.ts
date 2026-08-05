import { Routes } from '@angular/router';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';

export const routes: Routes = [
  { path: '', redirectTo: 'permissions', pathMatch: 'full' },
  { path: 'permissions', component: PermissionsComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'users', component: UsersComponent }
];
