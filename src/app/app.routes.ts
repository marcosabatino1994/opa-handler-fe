import { Routes } from '@angular/router';
import { PermissionsComponent } from './permissions/permissions.component';

export const routes: Routes = [
  { path: '', redirectTo: 'permissions', pathMatch: 'full' },
  { path: 'permissions', component: PermissionsComponent },
];
