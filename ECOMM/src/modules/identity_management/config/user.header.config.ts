export const UserHeaderConfig = {
    title: {
        display_name: "User Management",
        table_key: "users_table_1234",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/identity/management/users",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add User",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single User",
                description: "Create 1 user manually via form",
                popup_component: "create_user_modal",
                api: "/identity/management/users/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Users (Batch)",
                description: "Create N users via batch API",
                popup_component: "batch_create_modal",
                api: "/identity/management/users/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Users (File Upload)",
                description: "Upload .xlsx / .csv to create users",
                popup_component: "import_create_modal",
                api: "/identity/management/users/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing",
                popup_component: "import_update_modal",
                api: "/identity/management/users/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    }
};
