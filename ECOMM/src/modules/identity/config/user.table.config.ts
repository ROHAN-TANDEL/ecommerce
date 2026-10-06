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

        "table_lock_api" : "/identity/management/lock/users/table",
        "row_lock_api" : "/identity/management/lock/users/rows",
        "lock_status_api" : "/identity/management/lock/users",

        "export_data_api" : "/identity/management/export/users",
        "download_data_api" : "/identity/management/download/users",

        "get_view_api" : "/identity/management/view/users",
        "save_view_api" : "/identity/management/view/users/save",

        "live_talk_api" : "/identity/management/talk/users",
        "live_listen_api" : "/identity/management/listen/users",
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add User New",

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
