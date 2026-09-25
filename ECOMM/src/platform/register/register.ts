import express from 'express';

import {
    ApiRegistry,
    TenantValidator,
    RequestContextBuilder,
    ApiContextMiddleware,
    ApiErrorHandler
} from './platform';

import { Database } from './infra/database/pgsql';

import domains from './config/domains';

// 1. Initialize database
const database = new Database(domains);

// 2. Initialize platform components
const apiRegistry = new ApiRegistry(database);
const tenantValidator = new TenantValidator(database);
const contextBuilder = new RequestContextBuilder(apiRegistry, tenantValidator);
const apiMiddleware = new ApiContextMiddleware(apiRegistry, contextBuilder);
const errorHandler = new ApiErrorHandler();

// 3. Register APIs
apiRegistry.register({
    id: 'iam.user.get',
    method: 'GET',
    path: '/users/:id',
    domain: 'identity_access_management',
    tenant: true
});

apiRegistry.register({
    id: 'iam.tenant.create',
    method: 'POST',
    path: '/tenants',
    domain: 'identity_access_management',
    tenant: false
});
