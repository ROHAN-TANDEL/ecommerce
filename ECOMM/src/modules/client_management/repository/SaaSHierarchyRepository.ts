import db from "../../../platformdb/facade.js";
import type {
    Partner,
    Client,
    ClientProduct,
    ClientUser
} from "../entities/saas.entities.js";

export class SaaSHierarchyRepository {

    /**
     * 1. GLOBAL ADMIN VIEW: List All Partners
     * Returns partners with live counts of associated clients and products in use.
     */
    async getPartners(options: {
        limit?: number;
        offset?: number;
        search?: string;
        tier?: string;
        status?: string;
    } = {}): Promise<{ rows: Partner[]; total: number }> {
        const {
            limit = 25,
            offset = 0,
            search = '',
            tier = '',
            status = ''
        } = options;

        const values: any[] = [];
        let whereClauses: string[] = ['1=1'];

        if (search) {
            values.push(`%${search}%`);
            whereClauses.push(`(p.name ILIKE $${values.length} OR p.partner_code ILIKE $${values.length} OR p.email ILIKE $${values.length})`);
        }

        if (tier) {
            values.push(tier);
            whereClauses.push(`p.partner_tier = $${values.length}`);
        }

        if (status) {
            values.push(status);
            whereClauses.push(`p.status = $${values.length}`);
        }

        const whereSql = whereClauses.join(' AND ');

        // Count total
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM master.partners p
            WHERE ${whereSql}
        `;
        const countRes = await db.master.query(countQuery, values);
        const total = parseInt(countRes?.rows?.[0]?.total || '0', 10);

        // Fetch paginated rows with aggregated client_count and products_in_use
        const dataValues = [...values];
        dataValues.push(limit, offset);

        const query = `
            SELECT 
                p.id,
                p.partner_code,
                p.name,
                p.legal_name,
                p.partner_tier,
                p.status,
                p.email,
                p.phone,
                p.website,
                p.contact_person_name,
                p.contact_person_email,
                p.billing_currency,
                p.commission_rate,
                p.city,
                p.country,
                p.country_code,
                p.is_active,
                p.created_at,
                p.updated_at,
                COUNT(DISTINCT c.id)::int AS client_count,
                COUNT(DISTINCT cp.product_id)::int AS active_products_in_use
            FROM master.partners p
            LEFT JOIN master.clients c 
                ON c.partner_id = p.id AND c.status != 'DELETED'
            LEFT JOIN master.client_products cp 
                ON cp.client_id = c.id AND cp.status = 'ACTIVE'
            WHERE ${whereSql}
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
        `;

        const result = await db.master.query(query, dataValues);
        return {
            rows: result?.rows || [],
            total
        };
    }

    /**
     * Get single partner by ID
     */
    async getPartnerById(partnerId: number | string): Promise<Partner | null> {
        const query = `
            SELECT 
                p.*,
                COUNT(DISTINCT c.id)::int AS client_count,
                COUNT(DISTINCT cp.product_id)::int AS active_products_in_use
            FROM master.partners p
            LEFT JOIN master.clients c ON c.partner_id = p.id
            LEFT JOIN master.client_products cp ON cp.client_id = c.id AND cp.status = 'ACTIVE'
            WHERE p.id = $1
            GROUP BY p.id
            LIMIT 1
        `;
        const result = await db.master.query(query, [partnerId]);
        return result?.rows?.[0] || null;
    }

    /**
     * 2. PARTNER DRILLDOWN: List Clients for a given Partner
     * Returns clients belonging to partner_id with user count and active product count.
     */
    async getClientsByPartner(partnerId: number | string, options: {
        limit?: number;
        offset?: number;
        search?: string;
        status?: string;
    } = {}): Promise<{ rows: Client[]; total: number }> {
        const {
            limit = 25,
            offset = 0,
            search = '',
            status = ''
        } = options;

        const values: any[] = [partnerId];
        let whereClauses: string[] = ['c.partner_id = $1'];

        if (search) {
            values.push(`%${search}%`);
            whereClauses.push(`(c.client_name ILIKE $${values.length} OR c.client_code ILIKE $${values.length} OR c.domain ILIKE $${values.length})`);
        }

        if (status) {
            values.push(status);
            whereClauses.push(`c.status = $${values.length}`);
        }

        const whereSql = whereClauses.join(' AND ');

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM master.clients c
            WHERE ${whereSql}
        `;
        const countRes = await db.master.query(countQuery, values);
        const total = parseInt(countRes?.rows?.[0]?.total || '0', 10);

        const dataValues = [...values, limit, offset];

        const query = `
            SELECT 
                c.id,
                c.partner_id,
                c.client_code,
                c.client_name,
                c.legal_name,
                c.domain,
                c.industry,
                c.status,
                c.email,
                c.phone,
                c.website,
                c.contact_person_name,
                c.contact_person_email,
                c.max_users,
                c.schema_name,
                c.is_active,
                c.created_at,
                c.updated_at,
                COUNT(DISTINCT cu.id)::int AS user_count,
                COUNT(DISTINCT cp.product_id)::int AS product_count
            FROM master.clients c
            LEFT JOIN master.client_users cu 
                ON cu.client_id = c.id AND cu.status = 'ACTIVE'
            LEFT JOIN master.client_products cp 
                ON cp.client_id = c.id AND cp.status = 'ACTIVE'
            WHERE ${whereSql}
            GROUP BY c.id
            ORDER BY c.created_at DESC
            LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
        `;

        const result = await db.master.query(query, dataValues);
        return {
            rows: result?.rows || [],
            total
        };
    }

    /**
     * Get single client by ID
     */
    async getClientById(clientId: number | string): Promise<Client | null> {
        const query = `
            SELECT 
                c.*,
                p.name AS partner_name,
                p.partner_code,
                COUNT(DISTINCT cu.id)::int AS user_count,
                COUNT(DISTINCT cp.product_id)::int AS product_count
            FROM master.clients c
            JOIN master.partners p ON p.id = c.partner_id
            LEFT JOIN master.client_users cu ON cu.client_id = c.id
            LEFT JOIN master.client_products cp ON cp.client_id = c.id AND cp.status = 'ACTIVE'
            WHERE c.id = $1
            GROUP BY c.id, p.id
            LIMIT 1
        `;
        const result = await db.master.query(query, [clientId]);
        return result?.rows?.[0] || null;
    }

    /**
     * 3a. CLIENT DRILLDOWN: List Client Users
     * Lists users belonging to a client along with their accessible products.
     */
    async getClientUsers(clientId: number | string, options: {
        limit?: number;
        offset?: number;
        role?: string;
        status?: string;
    } = {}): Promise<{ rows: ClientUser[]; total: number }> {
        const {
            limit = 50,
            offset = 0,
            role = '',
            status = ''
        } = options;

        const values: any[] = [clientId];
        let whereClauses: string[] = ['cu.client_id = $1'];

        if (role) {
            values.push(role);
            whereClauses.push(`cu.role = $${values.length}`);
        }

        if (status) {
            values.push(status);
            whereClauses.push(`cu.status = $${values.length}`);
        }

        const whereSql = whereClauses.join(' AND ');

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM master.client_users cu
            WHERE ${whereSql}
        `;
        const countRes = await db.master.query(countQuery, values);
        const total = parseInt(countRes?.rows?.[0]?.total || '0', 10);

        const dataValues = [...values, limit, offset];

        const query = `
            SELECT 
                cu.id,
                cu.client_id,
                cu.user_code,
                cu.email,
                cu.first_name,
                cu.last_name,
                cu.job_title,
                cu.phone,
                cu.role,
                cu.status,
                cu.is_primary_contact,
                cu.last_login_at,
                cu.created_at,
                cu.updated_at,
                ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.name), NULL) AS accessible_products
            FROM master.client_users cu
            LEFT JOIN master.client_user_products cup 
                ON cup.client_user_id = cu.id AND cup.status = 'ACTIVE'
            LEFT JOIN master.client_products cp 
                ON cp.id = cup.client_product_id AND cp.status = 'ACTIVE'
            LEFT JOIN master.products p 
                ON p.id = cp.product_id
            WHERE ${whereSql}
            GROUP BY cu.id
            ORDER BY cu.is_primary_contact DESC, cu.created_at DESC
            LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
        `;

        const result = await db.master.query(query, dataValues);
        return {
            rows: result?.rows || [],
            total
        };
    }

    /**
     * 3b. CLIENT DRILLDOWN: List Products assigned to Client (with Launch & Redirect URLs)
     * Returns products this client has subscriptions/access to, including launch URL resolution.
     */
    async getClientProducts(clientId: number | string): Promise<ClientProduct[]> {
        const query = `
            SELECT 
                cp.id AS client_product_id,
                cp.client_id,
                cp.product_id,
                cp.license_type,
                cp.plan_tier,
                cp.status AS subscription_status,
                cp.max_seats,
                cp.allocated_seats,
                cp.external_tenant_id,
                cp.sso_enabled,
                cp.valid_from,
                cp.valid_to,
                cp.config AS client_product_config,
                cp.created_at,
                cp.updated_at,
                -- Joined Product Catalog Details
                p.product_code,
                p.name AS product_name,
                p.category AS product_category,
                p.description AS product_description,
                p.icon_url AS product_icon_url,
                p.version AS product_version,
                p.sso_client_id,
                -- Effective Launch URL (Client custom override or catalog default)
                COALESCE(cp.custom_launch_url, p.external_launch_url) AS effective_launch_url
            FROM master.client_products cp
            JOIN master.products p 
                ON p.id = cp.product_id
            WHERE cp.client_id = $1
            ORDER BY cp.status ASC, p.name ASC
        `;

        const result = await db.master.query(query, [clientId]);
        return result?.rows || [];
    }

    /**
     * 4. PRODUCT LAUNCH & EXTERNAL REDIRECTION
     * Resolves the exact destination launch URL and generates SSO payload/redirect parameters.
     */
    async resolveProductLaunchRedirect(clientId: number | string, productId: number | string, userEmail?: string): Promise<{
        targetUrl: string;
        externalTenantId: string | null;
        ssoClientId: string | null;
        productCode: string;
    } | null> {
        const query = `
            SELECT 
                cp.external_tenant_id,
                cp.custom_launch_url,
                p.product_code,
                p.external_launch_url,
                p.sso_client_id
            FROM master.client_products cp
            JOIN master.products p ON p.id = cp.product_id
            WHERE cp.client_id = $1 AND cp.product_id = $2 AND cp.status = 'ACTIVE'
            LIMIT 1
        `;

        const result = await db.master.query(query, [clientId, productId]);
        const record = result?.rows?.[0];
        if (!record) return null;

        const baseLaunchUrl = record.custom_launch_url || record.external_launch_url;
        const url = new URL(baseLaunchUrl);
        
        // Append SSO and tenant launch query parameters for downstream application
        if (record.external_tenant_id) {
            url.searchParams.set('tenant_id', record.external_tenant_id);
        }
        url.searchParams.set('client_id', String(clientId));
        if (userEmail) {
            url.searchParams.set('user_email', userEmail);
        }

        return {
            targetUrl: url.toString(),
            externalTenantId: record.external_tenant_id,
            ssoClientId: record.sso_client_id,
            productCode: record.product_code
        };
    }
}
