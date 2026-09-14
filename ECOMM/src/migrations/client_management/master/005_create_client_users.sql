CREATE TABLE IF NOT EXISTS client_users
(
    id BIGSERIAL PRIMARY KEY,

    client_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_client_users_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE CASCADE,

    CONSTRAINT unique_client_user
    UNIQUE (client_id, user_id)
    );