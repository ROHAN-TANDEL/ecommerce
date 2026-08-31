CREATE TABLE IF NOT EXISTS master.order_items (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  order_id BIGINT NOT NULL,
                                                  product_id BIGINT NOT NULL,
                                                  quantity INTEGER NOT NULL,
                                                  unit_price NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES master.orders(id)
    );