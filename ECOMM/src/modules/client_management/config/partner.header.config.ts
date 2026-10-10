export const PartnerHeaderConfig = {
    title: {
        display_name: "Partner Management",
        table_key: "partners_table_5001",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "/client/management/partners",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "+ Add Partner",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single Partner",
                description: "Create 1 partner manually via form",
                popup_component: "create_partner_modal",
                api: "/client/management/partners/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple Partners (Batch)",
                description: "Create N partners via batch API",
                popup_component: "batch_create_modal",
                api: "/client/management/partners/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import Partners (File Upload)",
                description: "Upload .xlsx / .csv to create partners",
                popup_component: "import_create_modal",
                api: "/client/management/partners/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing partners",
                popup_component: "import_update_modal",
                api: "/client/management/partners/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search partners...",
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
        partner_code: {
            key: "partner_code",
            name: "Partner Code",
            active: true,
            filter_type: "search",
            options: []
        },
        name: {
            key: "name",
            name: "Partner Name",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        partner_tier: {
            key: "partner_tier",
            name: "Tier",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "STANDARD",
                    "name": "Standard",
                    "default": true
          },
          {
                    "key": "SILVER",
                    "name": "Silver"
          },
          {
                    "key": "GOLD",
                    "name": "Gold"
          },
          {
                    "key": "PLATINUM",
                    "name": "Platinum"
          },
          {
                    "key": "STRATEGIC",
                    "name": "Strategic"
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
                    "key": "ONBOARDING",
                    "name": "Onboarding"
          }
            ]
        },
        client_count: {
            key: "client_count",
            name: "Total Clients",
            active: true,
            filter_type: "numeric",
            options: []
        },
        email: {
            key: "email",
            name: "Primary Email",
            active: true,
            filter_type: "search",
            options: []
        },
        phone: {
            key: "phone",
            name: "Phone",
            active: true,
            filter_type: "search",
            options: []
        },
        contact_person_name: {
            key: "contact_person_name",
            name: "Contact Lead",
            active: true,
            filter_type: "search",
            options: []
        },
        billing_currency: {
            key: "billing_currency",
            name: "Currency",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "USD",
                    "name": "USD ($)",
                    "default": true
          },
          {
                    "key": "EUR",
                    "name": "EUR (€)"
          },
          {
                    "key": "GBP",
                    "name": "GBP (£)"
          }
            ]
        },
        commission_rate: {
            key: "commission_rate",
            name: "Commission (%)",
            active: true,
            filter_type: "numeric",
            options: []
        },
        country: {
            key: "country",
            name: "Country",
            active: true,
            filter_type: "search",
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
