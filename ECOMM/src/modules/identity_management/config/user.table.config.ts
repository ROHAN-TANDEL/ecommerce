export const UserTableConfig = {
    "table_key" : "users_table_1234",
    "display_name" : "User Management",
    "readonly" : false,
    "table_api" : {

        "paginated_data_api" : "/identity/management/users",
        "data_api" : "/identity/management/users/:id",

        "create_api" : "/identity/management/users/create",
        "create_bulk_api" : "/identity/management/users/create/bulk",
        "create_all_api" : "/identity/management/users/create/all",
        "create_import_api" : "/identity/management/users/create/import",

        "update_api" : "/identity/management/users/update/:id",
        "update_bulk_api" : "/identity/management/users/update/bulk",
        "update_all_api" : "/identity/management/users/update/all",
        "update_import_api" : "/identity/management/users/update/import",

        "delete_api" : "/identity/management/users/delete/:id",
        "delete_bulk_api" : "/identity/management/users/delete/bulk",
        "delete_all_api" : "/identity/management/users/delete/all",

        "column_config_api" : "/identity/management/users/config/columns",
        "table_config_api" : "/identity/management/users/config/table",
        "action_panel_config_api" : "/identity/management/users/config/actions",
        "header_config_api" : "/identity/management/users/config/header",
        "row_actions_config_api" : "/identity/management/users/config/row-actions",

        "table_lock_api" : "/identity/management/users/lock/table",
        "row_lock_api" : "/identity/management/users/lock/rows",
        "lock_status_api" : "/identity/management/users/lock",

        "export_data_api" : "/identity/management/users/export",
        "download_data_api" : "/identity/management/users/download",

        "list_view_api" : "/identity/management/users/view/list",
        "save_view_api" : "/identity/management/users/view/create",
        "get_view_api" : "/identity/management/users/view/:id",
        "delete_view_api" : "/identity/management/users/view/:id",
        "default_view_api" : "/identity/management/users/view/:id/default",

        "live_talk_api" : "/identity/management/users/talk",
        "live_listen_api" : "/identity/management/users/listen",

        "ai_summary_api" : "/identity/management/users/ai/summary",
        "ai_interact_api" : "/identity/management/users/ai/interact",
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add User",

    "show_table_headers" : true,

    "enable_table_search_filters" : true,

    "enable_row_level_checkboxes" : true,

    "enable_master_level_checkbox" : true,

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
        ],
    },
    "rows" : {
        "row_expansion" : false,
        "freez" : true,
    },

    "pagination": {
        "active": true,
        "default_page_size": 10,
        "page_size_options": [10, 25, 50, 100, 200, 250]
    }
};
