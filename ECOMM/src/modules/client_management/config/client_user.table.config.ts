export const ClientUserTableConfig = {
    "table_key" : "client_users_table_5005",
    "display_name" : "Client Users",
    "readonly" : false,
    "table_api" : {
        "paginated_data_api" : "/client/management/client_users",
        "data_api" : "/client/management/client_users/:id",

        "create_api" : "/client/management/client_users/create",
        "create_bulk_api" : "/client/management/client_users/create/bulk",
        "create_all_api" : "/client/management/client_users/create/all",
        "create_import_api" : "/client/management/client_users/create/import",

        "update_api" : "/client/management/client_users/update/:id",
        "update_bulk_api" : "/client/management/client_users/update/bulk",
        "update_all_api" : "/client/management/client_users/update/all",
        "update_status_api" : "/client/management/client_users/update/status",
        "update_bulk_status_api" : "/client/management/client_users/update/bulk/status",
        "update_import_api" : "/client/management/client_users/update/import",

        "delete_api" : "/client/management/client_users/delete/:id",
        "delete_bulk_api" : "/client/management/client_users/delete/bulk",
        "delete_all_api" : "/client/management/client_users/delete/all",

        "column_config_api" : "/client/management/client_users/config/columns",
        "columns_config_api" : "/client/management/client_users/config/columns",
        "table_config_api" : "/client/management/client_users/config/table",
        "action_panel_config_api" : "/client/management/client_users/config/actions",
        "actions_config_api" : "/client/management/client_users/config/actions",
        "header_config_api" : "/client/management/client_users/config/header",
        "row_actions_config_api" : "/client/management/client_users/config/row-actions",

        "table_lock_api" : "/client/management/client_users/lock/table",
        "row_lock_api" : "/client/management/client_users/lock/rows",
        "lock_status_api" : "/client/management/client_users/lock",

        "export_data_api" : "/client/management/client_users/export",
        "download_data_api" : "/client/management/client_users/download",

        "list_view_api" : "/client/management/client_users/view/list",
        "save_view_api" : "/client/management/client_users/view/create",
        "get_view_api" : "/client/management/client_users/view/:id",
        "delete_view_api" : "/client/management/client_users/view/:id",
        "default_view_api" : "/client/management/client_users/view/:id/default",

        "live_talk_api" : "/client/management/client_users/talk",
        "live_listen_api" : "/client/management/client_users/listen",

        "ai_summary_api" : "/client/management/client_users/ai/summary",
        "ai_interact_api" : "/client/management/client_users/ai/interact"
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add Client User",
    "add_button_label" : "+ Add Client User",

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
