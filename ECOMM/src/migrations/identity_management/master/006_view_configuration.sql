-- Table: table_views
CREATE TABLE IF NOT EXISTS table_views (
                                                     id BIGSERIAL PRIMARY KEY,

    -- Target table identifier (matches ui_table_configs.unique_key or table_name)
                                                     table_key VARCHAR(100) NOT NULL,

    -- Owner user (NULL for global/system predefined views)
    user_id BIGINT REFERENCES master.users(id) ON DELETE CASCADE,

    -- View identity & display
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Behavior flags
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_shared BOOLEAN NOT NULL DEFAULT false,   -- If true, visible to other users in the same organization
    is_locked BOOLEAN NOT NULL DEFAULT false,   -- If true, read-only system/admin view

-- Core View Settings Payload
-- Contains: filters, pagination, column_pins, row_pins, density, sorting, column_state
    view_state JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                                   -- Constraints
                                                   -- 1. A user cannot have two views with the exact same name on the same table
                                                   CONSTRAINT uq_user_table_view_name UNIQUE (user_id, table_key, name)
    );

-- Indices for performance
-- Quick lookups when loading a table (fetch all views for current user + shared views)
CREATE INDEX IF NOT EXISTS idx_ui_table_views_lookup
    ON master.table_views (table_key, user_id, is_shared);

-- GIN index for JSONB queries (e.g. querying views containing a specific filter or density)
CREATE INDEX IF NOT EXISTS idx_ui_table_views_state_gin
    ON master.table_views USING gin (view_state);

-- Ensure only ONE default view per user per table
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_default_view_per_user
    ON master.table_views (user_id, table_key)
    WHERE is_default = true;