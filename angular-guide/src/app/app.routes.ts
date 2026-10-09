import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { DataTableTest } from './pages/data-table-test/data-table-test';
import { NexoraUser } from './pages/nexora-user/nexora-user';
import { Final } from "./pages/final/final";
import { Starter } from "./pages/starter/starter";
import { Live } from "./pages/live/live";
import { Principal } from "./pages/principal/principal";
import { Employees } from "./pages/employees/employees";
import { Customer } from './products/identity_management/customers/customers';

export const routes: Routes = [
    { path: 'login',           component: Login },
    { path: 'dashboard',       component: Dashboard },
    { path: 'data-table-test', component: DataTableTest },
    { path: 'nexora/users',     component: NexoraUser },
    { path: 'nexora/final',     component: Final },
    { path: 'nexora/starter',   component: Starter },
    { path: 'nexora/live',      component: Live },
    { path: 'nexora/principal', component: Principal },
    { path: 'nexora/emp',        component: Employees },
        { path: 'products/identity_management/customers', component: Customer },
{ path: '',                redirectTo: 'login', pathMatch: 'full' },
];
