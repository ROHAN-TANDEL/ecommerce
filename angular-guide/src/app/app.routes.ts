import { Routes } from '@angular/router';
import { Login } from './bkp/pages/login/login';
import { Dashboard } from './bkp/pages/dashboard/dashboard';
import { DataTableTest } from './bkp/pages/data-table-test/data-table-test';
import { NexoraUser } from './bkp/pages/nexora-user/nexora-user';
import { Final } from './bkp/pages/final/final';
import { Starter } from './bkp/pages/starter/starter';
import { Live } from './bkp/pages/live/live';
import { Principal } from './bkp/pages/principal/principal';
import { Employees } from './bkp/pages/employees/employees';
import { Customer } from './products/identity_management/customers/customers';
import { Partner } from './products/client_management/partners/partners';
import { Client } from './products/client_management/clients/clients';
import { Product } from './products/client_management/products/products';
import { ClientProduct } from './products/client_management/clientproducts/clientproducts';
import { ClientUser } from './products/client_management/clientusers/clientusers';

export const routes: Routes = [
    // Core Application Routes
        { path: 'nexora/partners', component: Partner },
    { path: 'products/client_management/partners', component: Partner },
    { path: 'nexora/clients', component: Client },
    { path: 'products/client_management/clients', component: Client },
    { path: 'nexora/products', component: Product },
    { path: 'products/client_management/products', component: Product },
    { path: 'nexora/clientproducts', component: ClientProduct },
    { path: 'products/client_management/clientproducts', component: ClientProduct },
    { path: 'nexora/clientusers', component: ClientUser },
    { path: 'products/client_management/clientusers', component: ClientUser },
{ path: '',                        redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login',                   component: Login },
    { path: 'dashboard',               component: Dashboard },

    // Primary Business Domain Routes (Clean URLs)
    { path: 'users',                   component: Employees },
    // { path: 'users/roles',             component: Employees },
    // { path: 'employees',               component: Employees },
    // { path: 'customers',               component: Customer },
    // { path: 'clients',                 component: Customer },
    // { path: 'partners',                component: Dashboard },

    // Product Module Routes
    // { path: 'products/identity_management/customers', component: Customer },
    // { path: 'products/identity_management/users',     component: Employees },

    // Nexora Showcase & Specialized Pages
    // { path: 'nexora/employees',        component: Employees },
    // { path: 'nexora/customers',        component: Customer },
    // { path: 'nexora/users',            component: NexoraUser },
    // { path: 'nexora/principal',        component: Principal },
    // { path: 'nexora/live',             component: Live },
    // { path: 'nexora/starter',          component: Starter },
    // { path: 'nexora/final',            component: Final },
    // { path: 'data-table-test',         component: DataTableTest },

    // Aliases & Backward Compatibility
    // { path: 'nexora/emp',              redirectTo: 'users', pathMatch: 'full' },
];
