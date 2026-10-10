export const CustomerHeaderConfig = {
    title: {
        display_name: "Customer Management",
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
                popup_component: "create_customer_modal",
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
                description: "Upload .xlsx / .csv to create customers",
                popup_component: "import_create_modal",
                api: "/identity/management/customers/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing customers",
                popup_component: "import_update_modal",
                api: "/identity/management/customers/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search customers...",
        info_note: "Global table search bar"
    },
    filters: {
        id: {
            key: "id",
            name: "ID",
            active: true,
            filter_type: "search",
            options: []
        },
        customer_code: {
            key: "customer_code",
            name: "Customer Code",
            active: true,
            filter_type: "search",
            options: []
        },
        customer_name: {
            key: "customer_name",
            name: "Customer Name",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        legal_name: {
            key: "legal_name",
            name: "Legal Name",
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
                    "key": "Active",
                    "name": "Active",
                    "default": true
          },
          {
                    "key": "Pending",
                    "name": "Pending"
          },
          {
                    "key": "Suspended",
                    "name": "Suspended"
          },
          {
                    "key": "Inactive",
                    "name": "Inactive"
          }
            ]
        },
        customer_type: {
            key: "customer_type",
            name: "Customer Type",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "Enterprise",
                    "name": "Enterprise"
          },
          {
                    "key": "Mid-Market",
                    "name": "Mid-Market"
          },
          {
                    "key": "SMB",
                    "name": "Small & Medium Business"
          },
          {
                    "key": "Individual",
                    "name": "Individual"
          },
          {
                    "key": "Government",
                    "name": "Government / Public Sector"
          }
            ]
        },
        industry: {
            key: "industry",
            name: "Industry",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        risk_level: {
            key: "risk_level",
            name: "Risk Level",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "Low",
                    "name": "Low Risk"
          },
          {
                    "key": "Medium",
                    "name": "Medium Risk"
          },
          {
                    "key": "High",
                    "name": "High Risk"
          },
          {
                    "key": "Critical",
                    "name": "Critical Risk"
          }
            ]
        },
        email: {
            key: "email",
            name: "Email",
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
        website: {
            key: "website",
            name: "Website",
            active: true,
            filter_type: "search",
            options: []
        },
        owner_name: {
            key: "owner_name",
            name: "Account Owner",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        owner_email: {
            key: "owner_email",
            name: "Owner Email",
            active: true,
            filter_type: "search",
            options: []
        },
        country: {
            key: "country",
            name: "Country",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        country_code: {
            key: "country_code",
            name: "Country Code",
            active: true,
            filter_type: "search",
            options: []
        },
        city: {
            key: "city",
            name: "City",
            active: true,
            filter_type: "multi_search",
            options: []
        },
        state: {
            key: "state",
            name: "State / Province",
            active: true,
            filter_type: "search",
            options: []
        },
        postal_code: {
            key: "postal_code",
            name: "Postal Code",
            active: true,
            filter_type: "search",
            options: []
        },
        address: {
            key: "address",
            name: "Address",
            active: true,
            filter_type: "search",
            options: []
        },
        annual_revenue: {
            key: "annual_revenue",
            name: "Annual Revenue",
            active: true,
            filter_type: "numeric",
            options: []
        },
        currency: {
            key: "currency",
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
          },
          {
                    "key": "INR",
                    "name": "INR (₹)"
          },
          {
                    "key": "CAD",
                    "name": "CAD ($)"
          },
          {
                    "key": "AUD",
                    "name": "AUD ($)"
          }
            ]
        },
        employee_count: {
            key: "employee_count",
            name: "Employees",
            active: true,
            filter_type: "numeric",
            options: []
        },
        onboarding_date: {
            key: "onboarding_date",
            name: "Onboarding Date",
            active: true,
            filter_type: "date_range",
            options: []
        },
        last_activity_at: {
            key: "last_activity_at",
            name: "Last Activity",
            active: true,
            filter_type: "date_range",
            options: []
        },
        is_active: {
            key: "is_active",
            name: "Is Active",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "true",
                    "name": "Active (true)",
                    "default": true
          },
          {
                    "key": "false",
                    "name": "Inactive (false)"
          }
            ]
        },
        editable: {
            key: "editable",
            name: "Editable",
            active: true,
            filter_type: "list",
            options: [
          {
                    "key": "true",
                    "name": "Yes (true)",
                    "default": true
          },
          {
                    "key": "false",
                    "name": "No (false)"
          }
            ]
        },
        created_at: {
            key: "created_at",
            name: "Created At",
            active: true,
            filter_type: "date_range",
            options: []
        },
        updated_at: {
            key: "updated_at",
            name: "Updated At",
            active: true,
            filter_type: "date_range",
            options: []
        }
    }
};
