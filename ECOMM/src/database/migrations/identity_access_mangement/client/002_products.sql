/* ============================================================
   PRODUCTS — shared across tenants
   ============================================================ */

CREATE TABLE IF NOT EXISTS client.products
(
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    product_key     VARCHAR(100)    NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,

    status          VARCHAR(50)     NOT NULL DEFAULT 'ACTIVE',

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_products
        PRIMARY KEY (id),

    CONSTRAINT uq_products_product_key
        UNIQUE (product_key)
);