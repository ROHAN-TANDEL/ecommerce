import { Routes } from '@angular/router';
import { Login } from './bkp/pages/login/login';
import { Dashboard } from './bkp/pages/dashboard/dashboard';
import { DataTableTest } from './bkp/pages/data-table-test/data-table-test';
import { NexoraUser } from './bkp/pages/nexora-user/nexora-user';
import { Final } from "./bkp/pages/final/final";
import { Starter } from "./bkp/pages/starter/starter";
import { Live } from "./bkp/pages/live/live";
import { Principal } from "./bkp/pages/principal/principal";
import { Employees } from "./bkp/pages/employees/employees";
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
    { path: 'nexora/customers',  component: Customer },
    { path: 'products/identity_management/customers', component: Customer },
    { path: 'users',             redirectTo: 'nexora/emp', pathMatch: 'full' },
    { path: 'clients',           redirectTo: 'nexora/customers', pathMatch: 'full' },
    { path: 'partners',          redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
];
