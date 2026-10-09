export const EmployeeHeaderConfig = {
    title: {
        display_name: "Employees Management",
        table_key: "employees_table_1234",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/identity/management/employees",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add Employee",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single Employee",
                description: "Create 1 employee manually via form",
                popup_component: "create_user_modal",
                api: "/identity/management/employees/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Employees (Batch)",
                description: "Create N employees via batch API",
                popup_component: "batch_create_modal",
                api: "/identity/management/employees/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Employees (File Upload)",
                description: "Upload .xlsx / .csv to create records",
                popup_component: "import_create_modal",
                api: "/identity/management/employees/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing",
                popup_component: "import_update_modal",
                api: "/identity/management/employees/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    }
};
