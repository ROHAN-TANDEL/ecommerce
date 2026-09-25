CREATE TABLE IF NOT EXISTS master.carts (
                                            id BIGSERIAL PRIMARY KEY,
                                            user_id BIGINT NOT NULL UNIQUE,
                                            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id)
    REFERENCES master.users(id)
    );