export const ClientUserHeaderConfig = {
    title: {
        display_name: "Client Users",
        table_key: "client_users_table_5005",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/client/management/client_users",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add Client User",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single ClientUser",
                description: "Create 1 clientuser manually via form",
                popup_component: "create_client_user_modal",
                api: "/client/management/client_users/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Clientusers (Batch)",
                description: "Create N client_users via batch API",
                popup_component: "batch_create_modal",
                api: "/client/management/client_users/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Clientusers (File Upload)",
                description: "Upload .xlsx / .csv to create client_users",
                popup_component: "import_create_modal",
                api: "/client/management/client_users/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing client_users",
                popup_component: "import_update_modal",
                api: "/client/management/client_users/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search client_users...",
        info_note: "Global table search bar"
    },
    filters: {
        id: {
            key: "id",
            name: "ID",
            active: true,
            filter_type: "numeric",
            options: []
        },
        client_name: {
            key: "client_name",
            name: "Client Name",
            active: true,
            filter_type: "search",
            options: []
        },
        client_id: {
            key: "client_id",
            name: "Client ID",
            active: false,
            filter_type: "numeric",
            options: []
        },
        first_name: {
            key: "first_name",
            name: "First Name",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        last_name: {
            key: "last_name",
            name: "Last Name",
            active: true,
            filter_type: "search",
            options: []
        },
        email: {
            key: "email",
            name: "Email",
            active: true,
            filter_type: "search",
            options: []
        },
        role: {
            key: "role",
            name: "Role",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "CLIENT_ADMIN",
                    "name": "Client Admin"
          },
          {
                    "key": "CLIENT_MANAGER",
                    "name": "Client Manager"
          },
          {
                    "key": "CLIENT_USER",
                    "name": "Client User",
                    "default": true
          },
          {
                    "key": "READ_ONLY",
                    "name": "Read Only"
          }
            ]
        },
        job_title: {
            key: "job_title",
            name: "Job Title",
            active: true,
            filter_type: "search",
            options: []
        },
        status: {
            key: "status",
            name: "Status",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "ACTIVE",
                    "name": "Active",
                    "default": true
          },
          {
                    "key": "INVITED",
                    "name": "Invited"
          },
          {
                    "key": "INACTIVE",
                    "name": "Inactive"
          },
          {
                    "key": "SUSPENDED",
                    "name": "Suspended"
          }
            ]
        },
        is_primary_contact: {
            key: "is_primary_contact",
            name: "Primary Contact",
            active: true,
            filter_type: "list",
            options: []
        },
        created_at: {
            key: "created_at",
            name: "Created On",
            active: true,
            filter_type: "date_range",
            options: []
        }
    }
};
