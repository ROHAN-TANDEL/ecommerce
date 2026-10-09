export const CustomerHeaderConfig = {
    title: {
        display_name: "Customers Management",
        table_key: "customers_table_1234",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/identity/management/customers",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add Customer",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single Customer",
                description: "Create 1 customer manually via form",
                popup_component: "create_user_modal",
                api: "/identity/management/customers/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Customers (Batch)",
                description: "Create N customers via batch API",
                popup_component: "batch_create_modal",
                api: "/identity/management/customers/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Customers (File Upload)",
                description: "Upload .xlsx / .csv to create records",
                popup_component: "import_create_modal",
                api: "/identity/management/customers/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing",
                popup_component: "import_update_modal",
                api: "/identity/management/customers/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    }
};
