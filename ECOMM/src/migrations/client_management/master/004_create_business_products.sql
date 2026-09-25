CREATE TABLE IF NOT EXISTS business_products
(
    id BIGSERIAL PRIMARY KEY,

    business_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'registered',

    enabled_at TIMESTAMP,
    disabled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_business_products_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_business_products_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

    CONSTRAINT unique_business_product
    UNIQUE (business_id, product_id)
    );