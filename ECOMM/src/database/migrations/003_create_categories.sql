CREATE TABLE IF NOT EXISTS master.categories (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );