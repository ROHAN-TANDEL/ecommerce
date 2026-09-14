CREATE TABLE IF NOT EXISTS clients
(
    id BIGSERIAL PRIMARY KEY,

    business_id BIGINT NOT NULL,

    client_code VARCHAR(100) NOT NULL UNIQUE,

    status VARCHAR(50) NOT NULL DEFAULT 'registered',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_clients_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE
    );