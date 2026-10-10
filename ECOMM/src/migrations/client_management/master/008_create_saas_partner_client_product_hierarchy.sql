-- ==============================================================================
-- Migration: 008_create_saas_partner_client_product_hierarchy.sql
-- Description: Multi-tenant SaaS Hierarchy (Partners -> Clients -> Products & Users)
-- Platform: PostgreSQL (schema: master / public fallback)
-- ==============================================================================

-- 1. Ensure master schema exists
CREATE SCHEMA IF NOT EXISTS master;
SET search_path TO master, public;

-- ==============================================================================
-- TABLE 1: PARTNERS (Top-level SaaS Partners / Resellers / MSPs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.partners (
    id BIGSERIAL PRIMARY KEY,
    partner_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    partner_tier VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- 'STANDARD', 'SILVER', 'GOLD', 'PLATINUM', 'STRATEGIC'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',          -- 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ONBOARDING'
    
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    
    contact_person_name VARCHAR(150),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(50),

    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    country_code CHAR(2),
    postal_code VARCHAR(50),

    billing_currency CHAR(3) NOT NULL DEFAULT 'USD',
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partners_status ON master.partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_tier ON master.partners(partner_tier);
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON master.partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON master.partners(created_at DESC);

-- ==============================================================================
-- TABLE 2: CLIENTS (Belong to a Partner: 1 Partner -> N Clients)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.clients (
    id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT NOT NULL,
    
    client_code VARCHAR(100) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    domain VARCHAR(255),
    industry VARCHAR(100),
    
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'
    
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    
    contact_person_name VARCHAR(150),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(50),

    address_line_1 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    country_code CHAR(2),
    postal_code VARCHAR(50),
    
    max_users INTEGER NOT NULL DEFAULT 50,
    schema_name VARCHAR(100), -- Multi-database / schema separation tenant key (e.g., 'i1000001')
    
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_clients_partner
        FOREIGN KEY (partner_id)
        REFERENCES master.partners(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clients_partner_id ON master.clients(partner_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON master.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON master.clients(domain);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON master.clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON master.clients(created_at DESC);

-- ==============================================================================
-- TABLE 3: PRODUCTS (Catalog of SaaS Applications / External Solutions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.products (
    id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'ECOMM', 'CRM', 'ANALYTICS', 'INVENTORY'
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'ENTERPRISE_APPLICATION',
    description TEXT,
    icon_url TEXT,
    
    -- Redirection & External App Launch Configuration
    external_launch_url TEXT NOT NULL,         -- e.g. 'https://crm.nexora.io/launch'
    sso_client_id VARCHAR(150),
    sso_client_secret VARCHAR(255),
    sso_redirect_uri TEXT,
    
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'BETA', 'DEPRECATED'
    
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_product_code ON master.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_status ON master.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON master.products(category);

-- ==============================================================================
-- TABLE 4: CLIENT_PRODUCTS (Subscriptions / Entitlements: 1 Client -> N Products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.client_products (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    
    license_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- 'FREE_TRIAL', 'STANDARD', 'PRO', 'ENTERPRISE'
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',     -- 'MONTHLY', 'ANNUAL', 'PERPETUAL'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',         -- 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED', 'TRIAL'
    
    max_seats INTEGER NOT NULL DEFAULT 10,
    allocated_seats INTEGER NOT NULL DEFAULT 0,
    
    -- External tenant / custom URL configuration for redirection
    external_tenant_id VARCHAR(150),                      -- Tenant identifier inside external product
    custom_launch_url TEXT,                               -- Overrides product external_launch_url if dedicated tenant domain
    sso_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMPTZ,
    
    config JSONB NOT NULL DEFAULT '{}'::jsonb,            -- Feature flags, product settings for this client
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_client_products_client
        FOREIGN KEY (client_id)
        REFERENCES master.clients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_client_products_product
        FOREIGN KEY (product_id)
        REFERENCES master.products(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_client_product
        UNIQUE (client_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_client_products_client_id ON master.client_products(client_id);
CREATE INDEX IF NOT EXISTS idx_client_products_product_id ON master.client_products(product_id);
CREATE INDEX IF NOT EXISTS idx_client_products_status ON master.client_products(status);
CREATE INDEX IF NOT EXISTS idx_client_products_valid_to ON master.client_products(valid_to);

-- ==============================================================================
-- TABLE 5: CLIENT_USERS (End Users belonging to a Client: 1 Client -> N Users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.client_users (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    user_code VARCHAR(50),
    
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    phone VARCHAR(50),
    
    role VARCHAR(50) NOT NULL DEFAULT 'CLIENT_USER', -- 'CLIENT_ADMIN', 'CLIENT_MANAGER', 'CLIENT_USER', 'READ_ONLY'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',     -- 'ACTIVE', 'INACTIVE', 'INVITED', 'SUSPENDED'
    
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash TEXT,
    auth_user_id BIGINT,                              -- Link to centralized master.users if unified SSO
    last_login_at TIMESTAMPTZ,
    
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_client_users_client
        FOREIGN KEY (client_id)
        REFERENCES master.clients(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_client_user_email
        UNIQUE (client_id, email)
);

CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON master.client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_users_email ON master.client_users(email);
CREATE INDEX IF NOT EXISTS idx_client_users_role ON master.client_users(role);
CREATE INDEX IF NOT EXISTS idx_client_users_status ON master.client_users(status);

-- ==============================================================================
-- TABLE 6: CLIENT_USER_PRODUCTS (Granular User Entitlements per Product)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.client_user_products (
    id BIGSERIAL PRIMARY KEY,
    client_user_id BIGINT NOT NULL,
    client_product_id BIGINT NOT NULL,
    
    product_role VARCHAR(50) NOT NULL DEFAULT 'USER', -- 'ADMIN', 'EDITOR', 'VIEWER', 'USER'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',     -- 'ACTIVE', 'REVOKED', 'PENDING'
    
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cup_client_user
        FOREIGN KEY (client_user_id)
        REFERENCES master.client_users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cup_client_product
        FOREIGN KEY (client_product_id)
        REFERENCES master.client_products(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_client_user_product
        UNIQUE (client_user_id, client_product_id)
);

CREATE INDEX IF NOT EXISTS idx_cup_client_user_id ON master.client_user_products(client_user_id);
CREATE INDEX IF NOT EXISTS idx_cup_client_product_id ON master.client_user_products(client_product_id);
