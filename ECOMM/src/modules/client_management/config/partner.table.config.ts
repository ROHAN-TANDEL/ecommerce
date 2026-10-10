export const PartnerTableConfig = {
    "table_key" : "partners_table_5001",
    "display_name" : "Partner Management",
    "readonly" : false,
    "table_api" : {
        "paginated_data_api" : "/client/management/partners",
        "data_api" : "/client/management/partners/:id",

        "create_api" : "/client/management/partners/create",
        "create_bulk_api" : "/client/management/partners/create/bulk",
        "create_all_api" : "/client/management/partners/create/all",
        "create_import_api" : "/client/management/partners/create/import",

        "update_api" : "/client/management/partners/update/:id",
        "update_bulk_api" : "/client/management/partners/update/bulk",
        "update_all_api" : "/client/management/partners/update/all",
        "update_status_api" : "/client/management/partners/update/status",
        "update_bulk_status_api" : "/client/management/partners/update/bulk/status",
        "update_import_api" : "/client/management/partners/update/import",

        "delete_api" : "/client/management/partners/delete/:id",
        "delete_bulk_api" : "/client/management/partners/delete/bulk",
        "delete_all_api" : "/client/management/partners/delete/all",

        "column_config_api" : "/client/management/partners/config/columns",
        "columns_config_api" : "/client/management/partners/config/columns",
        "table_config_api" : "/client/management/partners/config/table",
        "action_panel_config_api" : "/client/management/partners/config/actions",
        "actions_config_api" : "/client/management/partners/config/actions",
        "header_config_api" : "/client/management/partners/config/header",
        "row_actions_config_api" : "/client/management/partners/config/row-actions",

        "table_lock_api" : "/client/management/partners/lock/table",
        "row_lock_api" : "/client/management/partners/lock/rows",
        "lock_status_api" : "/client/management/partners/lock",

        "export_data_api" : "/client/management/partners/export",
        "download_data_api" : "/client/management/partners/download",

        "list_view_api" : "/client/management/partners/view/list",
        "save_view_api" : "/client/management/partners/view/create",
        "get_view_api" : "/client/management/partners/view/:id",
        "delete_view_api" : "/client/management/partners/view/:id",
        "default_view_api" : "/client/management/partners/view/:id/default",

        "live_talk_api" : "/client/management/partners/talk",
        "live_listen_api" : "/client/management/partners/listen",

        "ai_summary_api" : "/client/management/partners/ai/summary",
        "ai_interact_api" : "/client/management/partners/ai/interact"
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "+ Add Partner",
    "add_button_label" : "+ Add Partner",

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
