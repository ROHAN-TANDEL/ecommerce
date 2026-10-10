export const ClientTableConfig = {
    "table_key" : "clients_table_5002",
    "display_name" : "Client Management",
    "readonly" : false,
    "table_api" : {
        "paginated_data_api" : "/client/management/clients",
        "data_api" : "/client/management/clients/:id",

        "create_api" : "/client/management/clients/create",
        "create_bulk_api" : "/client/management/clients/create/bulk",
        "create_all_api" : "/client/management/clients/create/all",
        "create_import_api" : "/client/management/clients/create/import",

        "update_api" : "/client/management/clients/update/:id",
        "update_bulk_api" : "/client/management/clients/update/bulk",
        "update_all_api" : "/client/management/clients/update/all",
        "update_status_api" : "/client/management/clients/update/status",
        "update_bulk_status_api" : "/client/management/clients/update/bulk/status",
        "update_import_api" : "/client/management/clients/update/import",

        "delete_api" : "/client/management/clients/delete/:id",
        "delete_bulk_api" : "/client/management/clients/delete/bulk",
        "delete_all_api" : "/client/management/clients/delete/all",

        "column_config_api" : "/client/management/clients/config/columns",
        "columns_config_api" : "/client/management/clients/config/columns",
        "table_config_api" : "/client/management/clients/config/table",
        "action_panel_config_api" : "/client/management/clients/config/actions",
        "actions_config_api" : "/client/management/clients/config/actions",
        "header_config_api" : "/client/management/clients/config/header",
        "row_actions_config_api" : "/client/management/clients/config/row-actions",

        "table_lock_api" : "/client/management/clients/lock/table",
        "row_lock_api" : "/client/management/clients/lock/rows",
        "lock_status_api" : "/client/management/clients/lock",

        "export_data_api" : "/client/management/clients/export",
        "download_data_api" : "/client/management/clients/download",

        "list_view_api" : "/client/management/clients/view/list",
        "save_view_api" : "/client/management/clients/view/create",
        "get_view_api" : "/client/management/clients/view/:id",
        "delete_view_api" : "/client/management/clients/view/:id",
        "default_view_api" : "/client/management/clients/view/:id/default",

        "live_talk_api" : "/client/management/clients/talk",
        "live_listen_api" : "/client/management/clients/listen",

        "ai_summary_api" : "/client/management/clients/ai/summary",
        "ai_interact_api" : "/client/management/clients/ai/interact"
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add Client",
    "add_button_label" : "+ Add Client",

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
