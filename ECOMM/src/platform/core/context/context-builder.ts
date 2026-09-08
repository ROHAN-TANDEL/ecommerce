import { ApiRegistry } from '../registry/api-registry';
import { TenantValidatorStrategy, TenantContext } from './tenant-validator';

export interface ApiContext {
    id: string;
    method: string;
    path: string;
    domain: string;
}

export interface RequestContext {
    api: ApiContext;
    tenant?: TenantContext;
}

export class RequestContextBuilder {
    constructor(
        private readonly apiRegistry: ApiRegistry,
        private readonly tenantValidator: TenantValidatorStrategy
    ) {}

    async build(
        request: {
            method: string;
            path: string;
            headers: Record<string, string | string[] | undefined>;
            params?: Record<string, string>;
        },
        apiId: string
    ): Promise<RequestContext> {
        const api = this.apiRegistry.get(apiId);

        const context: RequestContext = {
            api: {
                id: api.id,
                method: api.method,
                path: api.path,
                domain: api.domain
            }
        };

        // If tenant not required, return early
        if (!api.tenant) {
            return context;
        }

        // Get tenant from header
        const tenantHeader = request.headers['x-tenant-id'];
        const tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;

        if (!tenantId) {
            throw new Error('Tenant ID is required (x-tenant-id header)');
        }

        // Validate tenant
        const tenant = await this.tenantValidator.validate(api.domain, tenantId);
        context.tenant = tenant;

        return context;
    }
}