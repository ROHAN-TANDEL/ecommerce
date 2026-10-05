// src/platform/core/context-builder.ts

import type { Request } from 'express';
import { ConnectionManager } from './connection-manager';
import { ApiRegistry } from './api-registry';
import { TenantValidator } from './tenant-validator';
import type { RequestContext } from './types';

export class ContextBuilder {
    constructor(
        private readonly connectionManager: ConnectionManager,
        private readonly apiRegistry: ApiRegistry,
        private readonly tenantValidator: TenantValidator
    ) {}

    /**
     * Build request context
     */
    async build(req: Request, apiId: string): Promise<RequestContext> {
        const api = this.apiRegistry.get(apiId);
        const domainConfig = this.connectionManager.getDomainConfig(api.domain);

        // Build basic context
        const context: RequestContext = {
            api: {
                id: api.id,
                method: api.method,
                path: api.path,
                domain: api.domain
            },
            db: {
                master: this.connectionManager.getMasterPool(api.domain),
                client: this.connectionManager.getClientPool(api.domain) || undefined
            }
        };

        // If tenant is required, validate it
        if (api.tenant && domainConfig.tenant.enabled) {
            const tenantId = req.headers[domainConfig.tenant.headerName] as string;
            if (!tenantId) {
                throw new Error(`Tenant ID required (${domainConfig.tenant.headerName})`);
            }
            const tenant = await this.tenantValidator.validate(api.domain, tenantId);
            context.tenant = tenant;
        }

        return context;
    }
}