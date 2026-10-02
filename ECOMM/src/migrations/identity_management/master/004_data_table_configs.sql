CREATE TABLE ui_table_configs (
                                  id SERIAL PRIMARY KEY,

    -- Unique identifier for the table (e.g. 'users_table_unique_key')
                                  unique_key VARCHAR(100) UNIQUE NOT NULL,

    -- Display details
                                  table_name VARCHAR(100) NOT NULL,        -- e.g. 'users'
                                  display_name VARCHAR(255),               -- e.g. 'Users Management'

    -- API Routing Information
                                  data_api VARCHAR(255) NOT NULL,          -- e.g. '/identity/management/users'
                                  update_api VARCHAR(255) NOT NULL,        -- e.g. '/identity/management/users/update/:id'
                                  config_api VARCHAR(255) NOT NULL,        -- e.g. '/identity/management/users/config/columns'
                                  table_config_api VARCHAR(255) NOT NULL,  -- e.g. '/identity/management/users/config/table'

    -- Primary key column of the target data table
                                  primary_key_col VARCHAR(50) DEFAULT 'id',

    -- Highly nested boolean feature flags (pagination, sorting, view, features)
    -- Stored as JSONB so the dashboard can easily push varying configs for different tables
                                  features JSONB NOT NULL DEFAULT '{}'::jsonb,

                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);