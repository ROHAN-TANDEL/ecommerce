export const EmployeeTableConfig = {
    "table_key" : "employees_table_1234",
    "display_name" : "Employees",
    "table_api" : {
        "table_config_api" : "/identity/management/employees/config/table",
        "columns_config_api" : "/identity/management/employees/config/columns",
        "actions_config_api" : "/identity/management/employees/config/actions",
        "header_config_api" : "/identity/management/employees/config/header",
        "row_actions_config_api" : "/identity/management/employees/config/row-actions",
        "paginated_data_api" : "/identity/management/employees",
        "create_api" : "/identity/management/employees/create",
        "create_all_api" : "/identity/management/employees/create/all",
        "create_import_api" : "/identity/management/employees/create/import",
        "data_api" : "/identity/management/employees/:id",
        "update_api" : "/identity/management/employees/update/:id",
        "update_bulk_api" : "/identity/management/employees/update/bulk",
        "update_all_api" : "/identity/management/employees/update/all",
        "update_status_api" : "/identity/management/employees/update/status",
        "update_bulk_status_api" : "/identity/management/employees/update/bulk/status",
        "update_import_api" : "/identity/management/employees/update/import",
        "delete_api" : "/identity/management/employees/delete/:id",
        "delete_all_api" : "/identity/management/employees/delete/all",
        "delete_bulk_api" : "/identity/management/employees/delete/bulk",
        "export_data_api" : "/identity/management/employees/export",
        "download_data_api" : "/identity/management/employees/download",
        "list_view_api" : "/identity/management/employees/view/list",
        "save_view_api" : "/identity/management/employees/view/create",
        "get_view_api" : "/identity/management/employees/view/:id",
        "delete_view_api" : "/identity/management/employees/view/:id",
        "default_view_api" : "/identity/management/employees/view/:id/default",
        "live_talk_api" : "/identity/management/employees/talk",
        "live_listen_api" : "/identity/management/employees/listen",
        "ai_summary_api" : "/identity/management/employees/ai/summary",
        "ai_interact_api" : "/identity/management/employees/ai/interact"
    },
    "show_title_header_section" : true,
    "enable_add_data_button" : true,
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
    "rows": {
        "row_expansion" : false,
        "freez" : true
    },
    "pagination": {
        "active" : true,
        "default_page_size" : 10,
        "page_size_options" : [10, 25, 50, 100]
    }
};
