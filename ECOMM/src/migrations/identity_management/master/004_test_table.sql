CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),

    email VARCHAR(255),
    phone VARCHAR(50),

    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    industry VARCHAR(100),

    country VARCHAR(100),
    country_code CHAR(2),

    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),

    website VARCHAR(255),

    annual_revenue NUMERIC(18, 2),
    currency CHAR(3),

    employee_count INTEGER,

    owner_name VARCHAR(150),
    owner_email VARCHAR(255),

    risk_level VARCHAR(30),
    customer_type VARCHAR(50),

    onboarding_date DATE,
    last_activity_at TIMESTAMP,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    editable BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_customers_status
    ON customers(status);

CREATE INDEX IF NOT EXISTS idx_customers_industry
    ON customers(industry);

CREATE INDEX IF NOT EXISTS idx_customers_country
    ON customers(country);

CREATE INDEX IF NOT EXISTS idx_customers_owner
    ON customers(owner_name);

CREATE INDEX IF NOT EXISTS idx_customers_created_at
    ON customers(created_at);