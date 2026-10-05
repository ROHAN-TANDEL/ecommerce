CREATE TABLE IF NOT EXISTS master.cart_items (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 cart_id BIGINT NOT NULL,
                                                 product_id BIGINT NOT NULL,
                                                 quantity INTEGER NOT NULL,
                                                 unit_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_cart_product
    UNIQUE (cart_id, product_id),

    CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES master.carts(id),

    CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES master.products(id)
    );