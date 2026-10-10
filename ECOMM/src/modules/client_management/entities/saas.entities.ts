/**
 * Multi-Tenant SaaS Platform Entity Definitions
 * Hierarchy: Global Admin -> Partner (1:N) -> Client (1:N) -> Products & Client Users
 */

export type PartnerTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'STRATEGIC';
export type PartnerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ONBOARDING';

export interface Partner {
    id: number | string;
    partner_code: string;
    name: string;
    legal_name?: string | null;
    partner_tier: PartnerTier;
    status: PartnerStatus;
    
    email: string;
    phone?: string | null;
    website?: string | null;
    
    contact_person_name?: string | null;
    contact_person_email?: string | null;
    contact_person_phone?: string | null;

    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    country_code?: string | null;
    postal_code?: string | null;

    billing_currency: string;
    commission_rate: number;
    
    metadata?: Record<string, any>;
    is_active: boolean;

    created_at: Date | string;
    updated_at: Date | string;

    // Computed / aggregated fields in listings
    client_count?: number;
    active_products_in_use?: number;
}

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface Client {
    id: number | string;
    partner_id: number | string;
    
    client_code: string;
    client_name: string;
    legal_name?: string | null;
    domain?: string | null;
    industry?: string | null;
    
    status: ClientStatus;
    
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    
    contact_person_name?: string | null;
    contact_person_email?: string | null;
    contact_person_phone?: string | null;

    address_line_1?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    country_code?: string | null;
    postal_code?: string | null;
    
    max_users: number;
    schema_name?: string | null;
    
    metadata?: Record<string, any>;
    is_active: boolean;

    created_at: Date | string;
    updated_at: Date | string;

    // Joined / aggregated fields
    partner?: Partner;
    user_count?: number;
    product_count?: number;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'BETA' | 'DEPRECATED';

export interface Product {
    id: number | string;
    product_code: string;
    name: string;
    category: string;
    description?: string | null;
    icon_url?: string | null;
    
    // External App Launch & SSO
    external_launch_url: string;
    sso_client_id?: string | null;
    sso_client_secret?: string | null;
    sso_redirect_uri?: string | null;
    
    version: string;
    status: ProductStatus;
    
    metadata?: Record<string, any>;
    is_active: boolean;

    created_at: Date | string;
    updated_at: Date | string;
}

export type LicenseType = 'FREE_TRIAL' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
export type PlanTier = 'MONTHLY' | 'ANNUAL' | 'PERPETUAL';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'TRIAL';

export interface ClientProduct {
    id: number | string;
    client_id: number | string;
    product_id: number | string;
    
    license_type: LicenseType;
    plan_tier: PlanTier;
    status: SubscriptionStatus;
    
    max_seats: number;
    allocated_seats: number;
    
    // External redirection & tenant integration
    external_tenant_id?: string | null;
    custom_launch_url?: string | null;
    sso_enabled: boolean;
    
    valid_from: Date | string;
    valid_to?: Date | string | null;
    
    config?: Record<string, any>;
    
    created_at: Date | string;
    updated_at: Date | string;

    // Joined product details for display & launch
    product?: Product;
    effective_launch_url?: string;
}

export type ClientUserRole = 'CLIENT_ADMIN' | 'CLIENT_MANAGER' | 'CLIENT_USER' | 'READ_ONLY';
export type ClientUserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'SUSPENDED';

export interface ClientUser {
    id: number | string;
    client_id: number | string;
    user_code?: string | null;
    
    email: string;
    first_name: string;
    last_name: string;
    job_title?: string | null;
    phone?: string | null;
    
    role: ClientUserRole;
    status: ClientUserStatus;
    
    is_primary_contact: boolean;
    auth_user_id?: number | string | null;
    last_login_at?: Date | string | null;
    
    metadata?: Record<string, any>;
    is_active: boolean;

    created_at: Date | string;
    updated_at: Date | string;

    // Aggregated product assignments
    accessible_products?: string[];
}

export interface ClientUserProduct {
    id: number | string;
    client_user_id: number | string;
    client_product_id: number | string;
    
    product_role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'USER';
    status: 'ACTIVE' | 'REVOKED' | 'PENDING';
    
    last_accessed_at?: Date | string | null;
    created_at: Date | string;
    updated_at: Date | string;
}
