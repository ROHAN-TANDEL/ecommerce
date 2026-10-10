export const ClientProductHeaderConfig = {
    title: {
        display_name: "Client Subscriptions",
        table_key: "client_products_table_5004",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/client/management/client_products",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Assign Product",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single ClientProduct",
                description: "Create 1 clientproduct manually via form",
                popup_component: "create_client_product_modal",
                api: "/client/management/client_products/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Clientproducts (Batch)",
                description: "Create N client_products via batch API",
                popup_component: "batch_create_modal",
                api: "/client/management/client_products/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Clientproducts (File Upload)",
                description: "Upload .xlsx / .csv to create client_products",
                popup_component: "import_create_modal",
                api: "/client/management/client_products/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing client_products",
                popup_component: "import_update_modal",
                api: "/client/management/client_products/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search client_products...",
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
        product_name: {
            key: "product_name",
            name: "Product",
            active: true,
            filter_type: "search",
            options: []
        },
        product_id: {
            key: "product_id",
            name: "Product ID",
            active: false,
            filter_type: "numeric",
            options: []
        },
        license_type: {
            key: "license_type",
            name: "License",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "FREE_TRIAL",
                    "name": "Free Trial"
          },
          {
                    "key": "STANDARD",
                    "name": "Standard",
                    "default": true
          },
          {
                    "key": "PRO",
                    "name": "Pro"
          },
          {
                    "key": "ENTERPRISE",
                    "name": "Enterprise"
          }
            ]
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
                    "key": "EXPIRED",
                    "name": "Expired"
          }
            ]
        },
        max_seats: {
            key: "max_seats",
            name: "Max Seats",
            active: true,
            filter_type: "numeric",
            options: []
        },
        allocated_seats: {
            key: "allocated_seats",
            name: "Used Seats",
            active: true,
            filter_type: "numeric",
            options: []
        },
        external_tenant_id: {
            key: "external_tenant_id",
            name: "External Tenant ID",
            active: true,
            filter_type: "search",
            options: []
        },
        effective_launch_url: {
            key: "effective_launch_url",
            name: "Launch URL",
            active: true,
            filter_type: "search",
            options: []
        },
        valid_to: {
            key: "valid_to",
            name: "Expires On",
            active: true,
            filter_type: "single_date",
            options: []
        }
    }
};
