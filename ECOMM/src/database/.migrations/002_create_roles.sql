CREATE TABLE IF NOT EXISTS master.roles (
                                            id BIGSERIAL PRIMARY KEY,
                                            name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );