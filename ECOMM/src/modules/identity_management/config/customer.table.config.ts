export const CustomerTableConfig = {
    "table_key" : "customers_table_1234",
    "display_name" : "Customer Management",
    "readonly" : false,
    "table_api" : {
        "paginated_data_api" : "/identity/management/customers",
        "data_api" : "/identity/management/customers/:id",

        "create_api" : "/identity/management/customers/create",
        "create_bulk_api" : "/identity/management/customers/create/bulk",
        "create_all_api" : "/identity/management/customers/create/all",
        "create_import_api" : "/identity/management/customers/create/import",

        "update_api" : "/identity/management/customers/update/:id",
        "update_bulk_api" : "/identity/management/customers/update/bulk",
        "update_all_api" : "/identity/management/customers/update/all",
        "update_status_api" : "/identity/management/customers/update/status",
        "update_bulk_status_api" : "/identity/management/customers/update/bulk/status",
        "update_import_api" : "/identity/management/customers/update/import",

        "delete_api" : "/identity/management/customers/delete/:id",
        "delete_bulk_api" : "/identity/management/customers/delete/bulk",
        "delete_all_api" : "/identity/management/customers/delete/all",

        "column_config_api" : "/identity/management/customers/config/columns",
        "columns_config_api" : "/identity/management/customers/config/columns",
        "table_config_api" : "/identity/management/customers/config/table",
        "action_panel_config_api" : "/identity/management/customers/config/actions",
        "actions_config_api" : "/identity/management/customers/config/actions",
        "header_config_api" : "/identity/management/customers/config/header",
        "row_actions_config_api" : "/identity/management/customers/config/row-actions",

        "table_lock_api" : "/identity/management/customers/lock/table",
        "row_lock_api" : "/identity/management/customers/lock/rows",
        "lock_status_api" : "/identity/management/customers/lock",

        "export_data_api" : "/identity/management/customers/export",
        "download_data_api" : "/identity/management/customers/download",

        "list_view_api" : "/identity/management/customers/view/list",
        "save_view_api" : "/identity/management/customers/view/create",
        "get_view_api" : "/identity/management/customers/view/:id",
        "delete_view_api" : "/identity/management/customers/view/:id",
        "default_view_api" : "/identity/management/customers/view/:id/default",

        "live_talk_api" : "/identity/management/customers/talk",
        "live_listen_api" : "/identity/management/customers/listen",

        "ai_summary_api" : "/identity/management/customers/ai/summary",
        "ai_interact_api" : "/identity/management/customers/ai/interact"
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add Customer",
    "add_button_label" : "+ Add Customer",

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
