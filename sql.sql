
-- Table: master.products

-- DROP TABLE IF EXISTS master.products;

CREATE TABLE IF NOT EXISTS master.products
(
    id bigserial NOT NULL,
    sku character varying(100) COLLATE pg_catalog."default" NOT NULL,
    category_id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    price numeric(12,2) NOT NULL,
    stock_quantity integer NOT NULL DEFAULT 0,
    status character varying(30) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVE'::character varying,
    version integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_sku_key UNIQUE (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES master.categories (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.products
    OWNER to root;


-- Table: master.roles

-- DROP TABLE IF EXISTS master.roles;

CREATE TABLE IF NOT EXISTS master.roles
(
    id bigserial NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_name_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.roles
    OWNER to root;


-- Table: master.users

-- DROP TABLE IF EXISTS master.users;

CREATE TABLE IF NOT EXISTS master.users
(
    id bigserial NOT NULL,
    first_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    role_id bigint NOT NULL,
    status character varying(30) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVE'::character varying,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id)
        REFERENCES master.roles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.users
    OWNER to root;



    -- Table: master.refresh_tokens

-- DROP TABLE IF EXISTS master.refresh_tokens;

CREATE TABLE IF NOT EXISTS master.refresh_tokens
(
    id bigserial NOT NULL,
    user_id bigint NOT NULL,
    token text COLLATE pg_catalog."default" NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id)
        REFERENCES master.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.refresh_tokens
    OWNER to root;



-- Table: master.files

-- DROP TABLE IF EXISTS master.files;

CREATE TABLE IF NOT EXISTS master.files
(
    id bigserial NOT NULL,
    user_id bigint NOT NULL,
    original_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    stored_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    mime_type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    size bigint NOT NULL,
    storage_path text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT files_pkey PRIMARY KEY (id),
    CONSTRAINT fk_files_user FOREIGN KEY (user_id)
        REFERENCES master.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.files
    OWNER to root;



    -- Table: master.categories

-- DROP TABLE IF EXISTS master.categories;

CREATE TABLE IF NOT EXISTS master.categories
(
    id bigserial NOT NULL,
    name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.categories
    OWNER to root;



    -- Table: master.carts

-- DROP TABLE IF EXISTS master.carts;

CREATE TABLE IF NOT EXISTS master.carts
(
    id bigserial NOT NULL,
    user_id bigint NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'ACTIVE'::character varying,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT carts_pkey PRIMARY KEY (id),
    CONSTRAINT carts_user_id_key UNIQUE (user_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id)
        REFERENCES master.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.carts
    OWNER to root;


    -- Table: master.cart_items

-- DROP TABLE IF EXISTS master.cart_items;

CREATE TABLE IF NOT EXISTS master.cart_items
(
    id bigserial NOT NULL,
    cart_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT cart_items_pkey PRIMARY KEY (id),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id)
        REFERENCES master.carts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id)
        REFERENCES master.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.cart_items
    OWNER to root;


-- Table: master.order_items
-- Table: master.audit_logs

-- DROP TABLE IF EXISTS master.audit_logs;

CREATE TABLE IF NOT EXISTS master.audit_logs
(
    id bigserial NOT NULL,
    event_id uuid NOT NULL,
    correlation_id uuid NOT NULL,
    user_id bigint,
    action character varying(100) COLLATE pg_catalog."default" NOT NULL,
    entity character varying(100) COLLATE pg_catalog."default" NOT NULL,
    entity_id character varying(100) COLLATE pg_catalog."default",
    metadata jsonb,
    ip_address character varying(50) COLLATE pg_catalog."default",
    user_agent text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
    CONSTRAINT audit_logs_event_id_key UNIQUE (event_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.audit_logs
    OWNER to root;
-- Index: idx_audit_logs_created_at

-- DROP INDEX IF EXISTS master.idx_audit_logs_created_at;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON master.audit_logs USING btree
    (created_at DESC NULLS FIRST)
    TABLESPACE pg_default;
-- Index: idx_audit_logs_entity

-- DROP INDEX IF EXISTS master.idx_audit_logs_entity;

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON master.audit_logs USING btree
    (entity COLLATE pg_catalog."default" ASC NULLS LAST, entity_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_audit_logs_user_id

-- DROP INDEX IF EXISTS master.idx_audit_logs_user_id;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON master.audit_logs USING btree
    (user_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- DROP TABLE IF EXISTS master.order_items;

CREATE TABLE IF NOT EXISTS master.order_items
(
    id bigserial NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    line_total numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES master.orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS master.order_items
    OWNER to root;