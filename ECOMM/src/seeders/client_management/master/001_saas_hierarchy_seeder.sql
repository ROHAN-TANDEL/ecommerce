-- ==============================================================================
-- Seeder: 001_saas_hierarchy_seeder.sql
-- Description: Sample Seed Data for SaaS Hierarchy (Partners -> Clients -> Products & Users)
-- Platform: PostgreSQL
-- ==============================================================================

SET search_path TO master, public;

-- 1. Insert Products into Catalog
INSERT INTO master.products (
    product_code, name, category, description, icon_url, external_launch_url, sso_client_id, version, status
) VALUES 
(
    'ECOMM', 
    'E-Commerce Suite', 
    'COMMERCE', 
    'Full headless commerce storefront, cart, checkout and payment engine.', 
    'https://assets.platform.io/icons/ecomm.svg', 
    'https://store.platform.io/launch', 
    'sso-ecomm-client-prod', 
    '2.4.0', 
    'ACTIVE'
),
(
    'CRM', 
    'Enterprise CRM', 
    'SALES_MARKETING', 
    'Customer relationship, pipeline tracking, lead scoring, and automated communications.', 
    'https://assets.platform.io/icons/crm.svg', 
    'https://crm.platform.io/launch', 
    'sso-crm-client-prod', 
    '3.1.2', 
    'ACTIVE'
),
(
    'ANALYTICS', 
    'Nexora Analytics & BI', 
    'BUSINESS_INTELLIGENCE', 
    'Unified executive dashboards, sales forecasting, cohorts, and realtime business metrics.', 
    'https://assets.platform.io/icons/analytics.svg', 
    'https://bi.platform.io/launch', 
    'sso-bi-client-prod', 
    '1.8.0', 
    'ACTIVE'
),
(
    'INVENTORY', 
    'Warehouse & Inventory Ops', 
    'SUPPLY_CHAIN', 
    'Multi-warehouse logistics, stock transfers, barcoding, and supplier purchase orders.', 
    'https://assets.platform.io/icons/inventory.svg', 
    'https://inventory.platform.io/launch', 
    'sso-inventory-client-prod', 
    '2.0.1', 
    'ACTIVE'
)
ON CONFLICT (product_code) DO NOTHING;

-- 2. Insert Partners
INSERT INTO master.partners (
    partner_code, name, legal_name, partner_tier, status, email, phone, website,
    contact_person_name, contact_person_email, billing_currency, commission_rate, city, country, country_code
) VALUES 
(
    'PTR-APEX-01', 
    'Apex Global Resellers', 
    'Apex Global Technologies Ltd.', 
    'PLATINUM', 
    'ACTIVE', 
    'partners@apextechnologies.io', 
    '+1-555-019-2831', 
    'https://apextechnologies.io', 
    'Marcus Vance', 
    'm.vance@apextechnologies.io', 
    'USD', 
    18.50, 
    'San Francisco', 
    'United States', 
    'US'
),
(
    'PTR-NOVA-02', 
    'Nova Cloud Aggregators', 
    'Nova Cloud Solutions Pte. Ltd.', 
    'GOLD', 
    'ACTIVE', 
    'alliances@novacloud.co', 
    '+44-20-7946-0912', 
    'https://novacloud.co', 
    'Elena Rostova', 
    'elena.r@novacloud.co', 
    'GBP', 
    15.00, 
    'London', 
    'United Kingdom', 
    'GB'
),
(
    'PTR-ZENITH-03', 
    'Zenith Enterprise Systems', 
    'Zenith Systems GmbH', 
    'STRATEGIC', 
    'ACTIVE', 
    'enterprise@zenith-systems.de', 
    '+49-89-2441-2099', 
    'https://zenith-systems.de', 
    'Hans Weber', 
    'h.weber@zenith-systems.de', 
    'EUR', 
    20.00, 
    'Munich', 
    'Germany', 
    'DE'
)
ON CONFLICT (partner_code) DO NOTHING;

-- 3. Insert Clients under Partners
-- Clients for Partner 1 (Apex)
INSERT INTO master.clients (
    partner_id, client_code, client_name, legal_name, domain, industry, status,
    email, phone, contact_person_name, contact_person_email, max_users, schema_name
) VALUES 
(
    (SELECT id FROM master.partners WHERE partner_code = 'PTR-APEX-01'),
    'CLI-LUMINA-101',
    'Lumina Retail Brands',
    'Lumina Consumer Goods Corp.',
    'lumina.apexpartners.io',
    'Retail & Consumer',
    'ACTIVE',
    'admin@lumina-retail.com',
    '+1-415-555-0143',
    'Sarah Jenkins',
    'sarah.j@lumina-retail.com',
    100,
    'lumina_retail'
),
(
    (SELECT id FROM master.partners WHERE partner_code = 'PTR-APEX-01'),
    'CLI-TITAN-102',
    'Titan Heavy Logistics',
    'Titan Freight Solutions LLC',
    'titan.apexpartners.io',
    'Logistics & Freight',
    'ACTIVE',
    'ops@titanheavy.com',
    '+1-312-555-0188',
    'Dave Matthews',
    'dave.m@titanheavy.com',
    50,
    'titan_freight'
),
-- Clients for Partner 2 (Nova)
(
    (SELECT id FROM master.partners WHERE partner_code = 'PTR-NOVA-02'),
    'CLI-SOLARIS-201',
    'Solaris Clean Energy',
    'Solaris Renewable Systems Ltd.',
    'solaris.novacloud.co',
    'CleanTech & Energy',
    'ACTIVE',
    'it@solaris-energy.co.uk',
    '+44-161-496-0177',
    'Claire O''Connor',
    'c.oconnor@solaris-energy.co.uk',
    75,
    'solaris_energy'
),
(
    (SELECT id FROM master.partners WHERE partner_code = 'PTR-NOVA-02'),
    'CLI-NEXUS-202',
    'Nexus Health Informatics',
    'Nexus Digital Health Group',
    'nexus.novacloud.co',
    'Healthcare & BioTech',
    'ACTIVE',
    'compliance@nexushealth.co.uk',
    '+44-20-7946-0855',
    'Dr. Aris Thorne',
    'a.thorne@nexushealth.co.uk',
    120,
    'nexus_health'
)
ON CONFLICT (client_code) DO NOTHING;

-- 4. Associate Products with Clients (Client Products subscriptions)
-- Lumina Retail gets ECOMM, CRM, ANALYTICS
INSERT INTO master.client_products (
    client_id, product_id, license_type, plan_tier, status, max_seats, allocated_seats,
    external_tenant_id, custom_launch_url, sso_enabled, config
) VALUES 
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-LUMINA-101'),
    (SELECT id FROM master.products WHERE product_code = 'ECOMM'),
    'ENTERPRISE',
    'ANNUAL',
    'ACTIVE',
    50,
    3,
    'tenant-lumina-ecomm',
    'https://lumina.store.platform.io/dashboard',
    TRUE,
    '{"theme": "dark", "multi_currency": true, "tax_integration": "avalara"}'::jsonb
),
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-LUMINA-101'),
    (SELECT id FROM master.products WHERE product_code = 'CRM'),
    'PRO',
    'ANNUAL',
    'ACTIVE',
    25,
    2,
    'tenant-lumina-crm',
    'https://lumina.crm.platform.io/app',
    TRUE,
    '{"lead_auto_assign": true, "pipeline": "enterprise"}'::jsonb
),
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-LUMINA-101'),
    (SELECT id FROM master.products WHERE product_code = 'ANALYTICS'),
    'STANDARD',
    'MONTHLY',
    'ACTIVE',
    10,
    1,
    'tenant-lumina-bi',
    'https://lumina.bi.platform.io',
    TRUE,
    '{"refresh_rate_mins": 15}'::jsonb
),
-- Titan Heavy Logistics gets INVENTORY and ANALYTICS
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-TITAN-102'),
    (SELECT id FROM master.products WHERE product_code = 'INVENTORY'),
    'ENTERPRISE',
    'ANNUAL',
    'ACTIVE',
    40,
    2,
    'tenant-titan-wms',
    'https://titan.inventory.platform.io',
    TRUE,
    '{"barcode_scanner": "2d", "zones": ["warehouse_a", "warehouse_b"]}'::jsonb
),
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-TITAN-102'),
    (SELECT id FROM master.products WHERE product_code = 'ANALYTICS'),
    'STANDARD',
    'ANNUAL',
    'ACTIVE',
    15,
    1,
    'tenant-titan-bi',
    'https://titan.bi.platform.io',
    TRUE,
    '{}'::jsonb
),
-- Solaris gets CRM
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-SOLARIS-201'),
    (SELECT id FROM master.products WHERE product_code = 'CRM'),
    'PRO',
    'MONTHLY',
    'ACTIVE',
    30,
    2,
    'tenant-solaris-crm',
    'https://solaris.crm.platform.io',
    TRUE,
    '{}'::jsonb
)
ON CONFLICT (client_id, product_id) DO NOTHING;

-- 5. Insert Client Users
INSERT INTO master.client_users (
    client_id, user_code, email, first_name, last_name, role, job_title, status, is_primary_contact
) VALUES 
-- Users for Lumina Retail
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-LUMINA-101'),
    'USR-LUM-001',
    'sarah.j@lumina-retail.com',
    'Sarah',
    'Jenkins',
    'CLIENT_ADMIN',
    'VP of Digital Operations',
    'ACTIVE',
    TRUE
),
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-LUMINA-101'),
    'USR-LUM-002',
    'kevin.lee@lumina-retail.com',
    'Kevin',
    'Lee',
    'CLIENT_MANAGER',
    'E-Commerce Merchandiser',
    'ACTIVE',
    FALSE
),
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-LUMINA-101'),
    'USR-LUM-003',
    'amanda.c@lumina-retail.com',
    'Amanda',
    'Chen',
    'CLIENT_USER',
    'Customer Care Lead',
    'ACTIVE',
    FALSE
),
-- Users for Titan Heavy Logistics
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-TITAN-102'),
    'USR-TIT-001',
    'dave.m@titanheavy.com',
    'Dave',
    'Matthews',
    'CLIENT_ADMIN',
    'Director of Logistics',
    'ACTIVE',
    TRUE
),
(
    (SELECT id FROM master.clients WHERE client_code = 'CLI-TITAN-102'),
    'USR-TIT-002',
    'raj.patel@titanheavy.com',
    'Raj',
    'Patel',
    'CLIENT_USER',
    'Fleet Supervisor',
    'ACTIVE',
    FALSE
)
ON CONFLICT (client_id, email) DO NOTHING;

-- 6. Assign Granular User Product Access
INSERT INTO master.client_user_products (
    client_user_id, client_product_id, product_role, status
) VALUES 
-- Sarah Jenkins gets Admin on Lumina's ECOMM and CRM
(
    (SELECT id FROM master.client_users WHERE email = 'sarah.j@lumina-retail.com'),
    (SELECT cp.id FROM master.client_products cp 
     JOIN master.clients c ON c.id = cp.client_id 
     JOIN master.products p ON p.id = cp.product_id 
     WHERE c.client_code = 'CLI-LUMINA-101' AND p.product_code = 'ECOMM'),
    'ADMIN',
    'ACTIVE'
),
(
    (SELECT id FROM master.client_users WHERE email = 'sarah.j@lumina-retail.com'),
    (SELECT cp.id FROM master.client_products cp 
     JOIN master.clients c ON c.id = cp.client_id 
     JOIN master.products p ON p.id = cp.product_id 
     WHERE c.client_code = 'CLI-LUMINA-101' AND p.product_code = 'CRM'),
    'ADMIN',
    'ACTIVE'
),
-- Kevin Lee gets Editor on ECOMM
(
    (SELECT id FROM master.client_users WHERE email = 'kevin.lee@lumina-retail.com'),
    (SELECT cp.id FROM master.client_products cp 
     JOIN master.clients c ON c.id = cp.client_id 
     JOIN master.products p ON p.id = cp.product_id 
     WHERE c.client_code = 'CLI-LUMINA-101' AND p.product_code = 'ECOMM'),
    'EDITOR',
    'ACTIVE'
)
ON CONFLICT (client_user_id, client_product_id) DO NOTHING;
