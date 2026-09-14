CREATE TABLE IF NOT EXISTS businesses
(
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    type VARCHAR(100),

    logo TEXT,

    email VARCHAR(255),

    phone VARCHAR(50),

    website VARCHAR(255),

    address_line_1 TEXT,

    address_line_2 TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    country VARCHAR(100),

    postal_code VARCHAR(50),

    status VARCHAR(50) NOT NULL DEFAULT 'registered',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );