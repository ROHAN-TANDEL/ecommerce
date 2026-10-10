-- ==============================================================================
-- Multi-Tenant SaaS Hierarchy DDL & Seed Script
-- Platform: PostgreSQL
-- Hierarchy: Global Admin -> Partners (1:N) -> Clients (1:N) -> Products & Users
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS master;
SET search_path TO master, public;

-- Drop in reverse dependency order if full fresh reset is needed
-- DROP TABLE IF EXISTS master.client_user_products CASCADE;
-- DROP TABLE IF EXISTS master.client_users CASCADE;
-- DROP TABLE IF EXISTS master.client_products CASCADE;
-- DROP TABLE IF EXISTS master.products CASCADE;
-- DROP TABLE IF EXISTS master.clients CASCADE;
-- DROP TABLE IF EXISTS master.partners CASCADE;

-- ==============================================================================
-- 1. PARTNERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.partners (
    id BIGSERIAL PRIMARY KEY,
    partner_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    partner_tier VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
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
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON master.partners(created_at DESC);

-- ==============================================================================
-- 2. CLIENTS TABLE (1 Partner -> N Clients)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.clients (
    id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT NOT NULL,
    
    client_code VARCHAR(100) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    domain VARCHAR(255),
    industry VARCHAR(100),
    
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
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
    schema_name VARCHAR(100),
    
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
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON master.clients(created_at DESC);

-- ==============================================================================
-- 3. PRODUCTS CATALOG TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.products (
    id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'ENTERPRISE_APPLICATION',
    description TEXT,
    icon_url TEXT,
    
    -- Redirection & Launch URL Config
    external_launch_url TEXT NOT NULL,
    sso_client_id VARCHAR(150),
    sso_client_secret VARCHAR(255),
    sso_redirect_uri TEXT,
    
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_product_code ON master.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_status ON master.products(status);

-- ==============================================================================
-- 4. CLIENT_PRODUCTS TABLE (1 Client -> N Products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.client_products (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    
    license_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
    max_seats INTEGER NOT NULL DEFAULT 10,
    allocated_seats INTEGER NOT NULL DEFAULT 0,
    
    external_tenant_id VARCHAR(150),
    custom_launch_url TEXT,
    sso_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMPTZ,
    
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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

-- ==============================================================================
-- 5. CLIENT_USERS TABLE (1 Client -> N Users)
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
    
    role VARCHAR(50) NOT NULL DEFAULT 'CLIENT_USER',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash TEXT,
    auth_user_id BIGINT,
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

-- ==============================================================================
-- 6. CLIENT_USER_PRODUCTS TABLE (User Entitlements per Product)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master.client_user_products (
    id BIGSERIAL PRIMARY KEY,
    client_user_id BIGINT NOT NULL,
    client_product_id BIGINT NOT NULL,
    
    product_role VARCHAR(50) NOT NULL DEFAULT 'USER',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    
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
