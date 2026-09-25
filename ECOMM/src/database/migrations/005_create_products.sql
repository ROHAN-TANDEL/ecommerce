CREATE TABLE IF NOT EXISTS master.products (
                                               id BIGSERIAL PRIMARY KEY,
                                               sku VARCHAR(100) NOT NULL UNIQUE,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES master.categories(id)
    );