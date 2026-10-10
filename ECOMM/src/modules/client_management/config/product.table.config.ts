export const ProductTableConfig = {
    "table_key" : "products_table_5003",
    "display_name" : "SaaS Products",
    "readonly" : false,
    "table_api" : {
        "paginated_data_api" : "/client/management/products",
        "data_api" : "/client/management/products/:id",

        "create_api" : "/client/management/products/create",
        "create_bulk_api" : "/client/management/products/create/bulk",
        "create_all_api" : "/client/management/products/create/all",
        "create_import_api" : "/client/management/products/create/import",

        "update_api" : "/client/management/products/update/:id",
        "update_bulk_api" : "/client/management/products/update/bulk",
        "update_all_api" : "/client/management/products/update/all",
        "update_status_api" : "/client/management/products/update/status",
        "update_bulk_status_api" : "/client/management/products/update/bulk/status",
        "update_import_api" : "/client/management/products/update/import",

        "delete_api" : "/client/management/products/delete/:id",
        "delete_bulk_api" : "/client/management/products/delete/bulk",
        "delete_all_api" : "/client/management/products/delete/all",

        "column_config_api" : "/client/management/products/config/columns",
        "columns_config_api" : "/client/management/products/config/columns",
        "table_config_api" : "/client/management/products/config/table",
        "action_panel_config_api" : "/client/management/products/config/actions",
        "actions_config_api" : "/client/management/products/config/actions",
        "header_config_api" : "/client/management/products/config/header",
        "row_actions_config_api" : "/client/management/products/config/row-actions",

        "table_lock_api" : "/client/management/products/lock/table",
        "row_lock_api" : "/client/management/products/lock/rows",
        "lock_status_api" : "/client/management/products/lock",

        "export_data_api" : "/client/management/products/export",
        "download_data_api" : "/client/management/products/download",

        "list_view_api" : "/client/management/products/view/list",
        "save_view_api" : "/client/management/products/view/create",
        "get_view_api" : "/client/management/products/view/:id",
        "delete_view_api" : "/client/management/products/view/:id",
        "default_view_api" : "/client/management/products/view/:id/default",

        "live_talk_api" : "/client/management/products/talk",
        "live_listen_api" : "/client/management/products/listen",

        "ai_summary_api" : "/client/management/products/ai/summary",
        "ai_interact_api" : "/client/management/products/ai/interact"
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add Product",
    "add_button_label" : "+ Add Product",

    "show_table_headers" : true,

    "enable_table_search_filters" : true,

    "enable_row_level_checkboxes" : true,

    "enable_master_level_checkbox" : true,

    "min_height" : "380px",
    "max_height" : "calc(100vh - 240px)",
    "editable_single_multiple_selected_rows" : true,
    "editable_all_rows" : true,

    "action_panel" : true,

    "action_column" : {
        "active" : true,
        "options" : [
            "refresh",
            "disable",
            "revert",
            "view",
            "pin / unpin",
            "lock",
            "edit",
            "delete"
        ]
    },

    "rows" : {
        "row_expansion" : false,
        "freez" : false
    },

    "pagination": {
        "active": true,
        "default_page_size": 10,
        "page_size_options": [10, 25, 50, 100, 200, 250]
    }
};
