-- Customer UI Table Config & Sample Data Seeder

SET search_path TO master, public;

INSERT INTO master.ui_table_configs (
    unique_key, 
    table_name, 
    display_name, 
    data_api, 
    update_api, 
    config_api, 
    table_config_api, 
    primary_key_col, 
    features
) VALUES (
    'customers_table_1234',
    'customers',
    'Customer Management',
    '/identity/management/customers',
    '/identity/management/customers/update/:id',
    '/identity/management/customers/config/columns',
    '/identity/management/customers/config/table',
    'id',
    '{
        "show_headers": true,
        "live_count_panel": true,
        "main_action_panel": true,
        "show_checkboxes": true,
        "fixed_checkboxes": true,
        "fixed_actions": true,
        "show_actions": true,
        "row_expansion": true,
        "selection": {
            "enabled": true,
            "multiple": true
        },
        "pagination": {
            "enabled": true,
            "default_page_size": 25,
            "page_size_options": [10, 25, 50, 100, 200, 250]
        },
        "sorting": {
            "enabled": true,
            "multiple": true
        },
        "filtering": {
            "enabled": true
        },
        "editing": {
            "enabled": true,
            "row_editable": true
        },
        "actions": {
            "edit": true,
            "delete": true,
            "enable": true,
            "disable": true,
            "revert": true,
            "more": true
        },
        "export": {
            "enabled": true,
            "formats": ["excel", "csv"]
        },
        "download": {
            "enabled": true,
            "formats": ["excel", "csv"]
        },
        "column_management": {
            "enabled": true,
            "reorder": true,
            "show_hide": false
        },
        "column_freeze": {
            "enabled": true,
            "start": 2,
            "end": 1
        },
        "row_freeze": {
            "enabled": true,
            "top": 2,
            "bottom": 0
        },
        "column_resize": {
            "enabled": true
        },
        "view": {
            "fullscreen": true,
            "density": true,
            "default_density": "comfortable"
        },
        "live_collaboration": {
            "enabled": true
        },
        "features": {
            "column_navigation": true,
            "column_count_indicator": true,
            "save_view": true,
            "reset_view": true
        }
    }'::jsonb
) ON CONFLICT (unique_key) DO UPDATE 
SET 
    table_name = EXCLUDED.table_name,
    display_name = EXCLUDED.display_name,
    data_api = EXCLUDED.data_api,
    update_api = EXCLUDED.update_api,
    config_api = EXCLUDED.config_api,
    table_config_api = EXCLUDED.table_config_api,
    primary_key_col = EXCLUDED.primary_key_col,
    features = EXCLUDED.features;

-- Sample customers for rich filter testing
INSERT INTO master.customers (
    customer_code, customer_name, legal_name, email, phone, status, customer_type, 
    industry, risk_level, country, country_code, city, state, address, postal_code, 
    annual_revenue, currency, employee_count, owner_name, owner_email, onboarding_date, 
    is_active, editable
) VALUES 
(
    'CUST-001', 'Acme Corp', 'Acme International LLC', 'billing@acme.com', '+1-555-0101', 
    'Active', 'Enterprise', 'Technology', 'Low', 'United States', 'US', 'San Francisco', 
    'California', '100 Market St', '94105', 5000000.00, 'USD', 350, 'Sarah Connor', 
    'sarah@nexora.io', '2024-01-15', true, true
),
(
    'CUST-002', 'Global Logistics AG', 'Global Logistics Aktiengesellschaft', 'info@globallogistics.de', '+49-30-123456', 
    'Pending', 'Mid-Market', 'Logistics', 'Medium', 'Germany', 'DE', 'Berlin', 
    'Berlin', 'Alexanderplatz 1', '10178', 1200000.00, 'EUR', 120, 'Hans Gruber', 
    'hans@nexora.io', '2024-03-20', true, true
),
(
    'CUST-003', 'Apex Health Systems', 'Apex Healthcare Inc.', 'ops@apexhealth.co.uk', '+44-20-794609', 
    'Active', 'Enterprise', 'Healthcare', 'Low', 'United Kingdom', 'GB', 'London', 
    'Greater London', '221B Baker St', 'NW1 6XE', 8500000.00, 'GBP', 890, 'Elena Rostova', 
    'elena@nexora.io', '2023-11-05', true, true
),
(
    'CUST-004', 'Nordic Retail Solutions', 'Nordic Retail AS', 'contact@nordicretail.se', '+46-8-1234567', 
    'Suspended', 'SMB', 'Retail', 'High', 'Sweden', 'SE', 'Stockholm', 
    'Stockholm', 'Drottninggatan 10', '11151', 450000.00, 'EUR', 28, 'Lars Thorne', 
    'lars@nexora.io', '2024-06-01', true, true
),
(
    'CUST-005', 'Zenith FinTech', 'Zenith Financial Technologies Ltd', 'support@zenithfin.sg', '+65-6789-0123', 
    'Active', 'Enterprise', 'Finance', 'Low', 'Singapore', 'SG', 'Singapore', 
    'Singapore', '1 Marina Boulevard', '018989', 12000000.00, 'USD', 420, 'Sarah Connor', 
    'sarah@nexora.io', '2023-08-10', true, true
),
(
    'CUST-006', 'Beacon Media Labs', 'Beacon Media & Creative LLC', 'hello@beaconmedia.ca', '+1-416-555-0199', 
    'Inactive', 'SMB', 'Media', 'Medium', 'Canada', 'CA', 'Toronto', 
    'Ontario', '45 King St W', 'M5H 1J8', 320000.00, 'CAD', 15, 'Hans Gruber', 
    'hans@nexora.io', '2024-02-18', false, true
)
ON CONFLICT (customer_code) DO NOTHING;
