export const ProductHeaderConfig = {
    title: {
        display_name: "SaaS Products",
        table_key: "products_table_5003",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/client/management/products",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add Product",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single Product",
                description: "Create 1 product manually via form",
                popup_component: "create_product_modal",
                api: "/client/management/products/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Products (Batch)",
                description: "Create N products via batch API",
                popup_component: "batch_create_modal",
                api: "/client/management/products/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Products (File Upload)",
                description: "Upload .xlsx / .csv to create products",
                popup_component: "import_create_modal",
                api: "/client/management/products/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing products",
                popup_component: "import_update_modal",
                api: "/client/management/products/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search products...",
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
        product_code: {
            key: "product_code",
            name: "Product Code",
            active: true,
            filter_type: "search",
            options: []
        },
        name: {
            key: "name",
            name: "Product Name",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        category: {
            key: "category",
            name: "Category",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "COMMERCE",
                    "name": "Commerce & Stores",
                    "default": true
          },
          {
                    "key": "SALES_MARKETING",
                    "name": "Sales & CRM"
          },
          {
                    "key": "BUSINESS_INTELLIGENCE",
                    "name": "Analytics & BI"
          },
          {
                    "key": "SUPPLY_CHAIN",
                    "name": "Inventory & Logistics"
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
                    "key": "BETA",
                    "name": "Beta"
          },
          {
                    "key": "INACTIVE",
                    "name": "Inactive"
          },
          {
                    "key": "DEPRECATED",
                    "name": "Deprecated"
          }
            ]
        },
        version: {
            key: "version",
            name: "Version",
            active: true,
            filter_type: "search",
            options: []
        },
        external_launch_url: {
            key: "external_launch_url",
            name: "External Launch URL",
            active: true,
            filter_type: "search",
            options: []
        },
        sso_client_id: {
            key: "sso_client_id",
            name: "SSO Client ID",
            active: true,
            filter_type: "search",
            options: []
        },
        subscribed_clients_count: {
            key: "subscribed_clients_count",
            name: "Active Subscriptions",
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
