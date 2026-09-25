CREATE TABLE IF NOT EXISTS businesses_sample
(
    id BIGSERIAL PRIMARY KEY,

    crm_id VARCHAR(255),

    client_id VARCHAR(255),

    business_name VARCHAR(255) NOT NULL,

    logo TEXT,

    address TEXT,

    contact_email VARCHAR(255),

    contact_phone VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );