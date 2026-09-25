CREATE TABLE IF NOT EXISTS master.orders (
                                             id BIGSERIAL PRIMARY KEY,
                                             user_id BIGINT NOT NULL,
                                             order_number UUID NOT NULL UNIQUE,
                                             status VARCHAR(30) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    total_items INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES master.users(id)
    );