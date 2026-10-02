import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { DataTableTest } from './pages/data-table-test/data-table-test';
import { NexoraUser } from './pages/nexora-user/nexora-user';

export const routes: Routes = [
  { path: 'login',           component: Login },
  { path: 'dashboard',       component: Dashboard },
  { path: 'data-table-test', component: DataTableTest },
  { path: 'nexora/user',     component: NexoraUser },
  { path: '',                redirectTo: 'login', pathMatch: 'full' },
];
