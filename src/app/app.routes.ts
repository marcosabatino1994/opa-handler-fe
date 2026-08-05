import { Routes } from '@angular/router';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { TestAppComponent } from './test-app/test-app.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'permissions', pathMatch: 'full' },
  { path: 'permissions', component: PermissionsComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'users', component: UsersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'test', component: TestAppComponent, canActivate: [authGuard] },
];
