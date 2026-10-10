export const ClientHeaderConfig = {
    title: {
        display_name: "Client Management",
        table_key: "clients_table_5002",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/client/management/clients",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add Client",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single Client",
                description: "Create 1 client manually via form",
                popup_component: "create_client_modal",
                api: "/client/management/clients/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Clients (Batch)",
                description: "Create N clients via batch API",
                popup_component: "batch_create_modal",
                api: "/client/management/clients/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Clients (File Upload)",
                description: "Upload .xlsx / .csv to create clients",
                popup_component: "import_create_modal",
                api: "/client/management/clients/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing clients",
                popup_component: "import_update_modal",
                api: "/client/management/clients/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search clients...",
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
        partner_name: {
            key: "partner_name",
            name: "Partner",
            active: true,
            filter_type: "search",
            options: []
        },
        partner_id: {
            key: "partner_id",
            name: "Partner ID",
            active: false,
            filter_type: "numeric",
            options: []
        },
        client_code: {
            key: "client_code",
            name: "Client Code",
            active: true,
            filter_type: "search",
            options: []
        },
        client_name: {
            key: "client_name",
            name: "Client Name",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        domain: {
            key: "domain",
            name: "Domain / Host",
            active: true,
            filter_type: "search",
            options: []
        },
        industry: {
            key: "industry",
            name: "Industry",
            active: true,
            filter_type: "list",
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
                    "key": "INACTIVE",
                    "name": "Inactive"
          },
          {
                    "key": "SUSPENDED",
                    "name": "Suspended"
          },
          {
                    "key": "PENDING",
                    "name": "Pending"
          }
            ]
        },
        user_count: {
            key: "user_count",
            name: "Users",
            active: true,
            filter_type: "numeric",
            options: []
        },
        product_count: {
            key: "product_count",
            name: "Products",
            active: true,
            filter_type: "numeric",
            options: []
        },
        contact_person_name: {
            key: "contact_person_name",
            name: "Client Lead",
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
        max_users: {
            key: "max_users",
            name: "Max Users",
            active: true,
            filter_type: "numeric",
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
