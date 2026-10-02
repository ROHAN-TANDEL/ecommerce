INSERT INTO ui_table_configs (
    unique_key, 
    table_name, 
    display_name, 
    data_api, 
    update_api, 
    config_api, 
    table_config_api, 
    primary_key_col, 
    features
) VALUES (
    'users_table_unique_key',
    'users',
    'Users Management',
    '/identity/management/users',
    '/identity/management/users/update/:id',
    '/identity/management/users/config/columns',
    '/identity/management/users/config/table',
    'id',
    '{
        "show_headers": true,
        "live_count_panel": true,
        "main_action_panel": true,
        "show_checkboxes": true,
        "fixed_checkboxes": true,
        "fixed_actions": true,
        "show_actions": true,
        "row_expansion": true,
        "selection": {
            "enabled": true,
            "multiple": true
        },
        "pagination": {
            "enabled": true,
            "default_page_size": 25,
            "page_size_options": [10, 25, 50, 100]
        },
        "sorting": {
            "enabled": true,
            "multiple": true
        },
        "filtering": {
            "enabled": true
        },
        "editing": {
            "enabled": true,
            "row_editable": true
        },
        "actions": {
            "edit": true,
            "delete": true,
            "enable": true,
            "disable": true,
            "revert": true,
            "more": true
        },
        "export": {
            "enabled": true,
            "formats": ["excel", "csv"]
        },
        "download": {
            "enabled": true,
            "formats": ["excel", "csv"]
        },
        "column_management": {
            "enabled": true,
            "reorder": true,
            "show_hide": false
        },
        "column_freeze": {
            "enabled": true,
            "start": 2,
            "end": 1
        },
        "row_freeze": {
            "enabled": true,
            "top": 2,
            "bottom": 0
        },
        "column_resize": {
            "enabled": true
        },
        "view": {
            "fullscreen": true,
            "density": true,
            "default_density": "comfortable"
        },
        "live_collaboration": {
            "enabled": true
        },
        "features": {
            "column_navigation": true,
            "column_count_indicator": true,
            "save_view": true,
            "reset_view": true
        }
    }'::jsonb
) ON CONFLICT (unique_key) DO UPDATE 
SET 
    table_name = EXCLUDED.table_name,
    display_name = EXCLUDED.display_name,
    data_api = EXCLUDED.data_api,
    update_api = EXCLUDED.update_api,
    config_api = EXCLUDED.config_api,
    table_config_api = EXCLUDED.table_config_api,
    primary_key_col = EXCLUDED.primary_key_col,
    features = EXCLUDED.features;
