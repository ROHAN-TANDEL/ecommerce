export const CustomerColumnConfig = {
    id: {
        header_name: "ID",
        filter_key: "id",
        columns: {
            customers: "id"
        },
        order: 1,
        filter_type: "search",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Customer unique identifier",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    customer_code: {
        header_name: "Customer Code",
        filter_key: "customer_code",
        columns: {
            customers: "customer_code"
        },
        order: 1,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Unique customer reference code",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "Customer code is required",
            info_note: "Enter unique customer identifier"
        },
        filter_data: []
    },
    customer_name: {
        header_name: "Customer Name",
        filter_key: "customer_name",
        columns: {
            customers: "customer_name"
        },
        order: 2,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Primary business display name",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "Customer name is required",
            info_note: "Enter customer trade name"
        },
        filter_data: []
    },
    legal_name: {
        header_name: "Legal Name",
        filter_key: "legal_name",
        columns: {
            customers: "legal_name"
        },
        order: 3,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Registered legal entity name",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_1",
            required: false,
            error_note: "",
            info_note: "Official registered legal name"
        },
        filter_data: []
    },
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: {
            customers: "status"
        },
        order: 4,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Current account operational status",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        cell_mode: "text_code_1000",
        modal: {
            order: 4,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "Status selection is required",
            info_note: "Select operational status"
        },
        filter_data: [
          {
                    "key": "Active",
                    "name": "Active",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "Pending",
                    "name": "Pending",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Suspended",
                    "name": "Suspended",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Inactive",
                    "name": "Inactive",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    customer_type: {
        header_name: "Customer Type",
        filter_key: "customer_type",
        columns: {
            customers: "customer_type"
        },
        order: 5,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Classification of the customer account",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "text_code_1000",
        modal: {
            order: 5,
            horizontal_section: "h_section_1",
            required: false,
            error_note: "",
            info_note: "Select business customer tier/type"
        },
        filter_data: [
          {
                    "key": "Enterprise",
                    "name": "Enterprise",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Mid-Market",
                    "name": "Mid-Market",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "SMB",
                    "name": "Small & Medium Business",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Individual",
                    "name": "Individual",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Government",
                    "name": "Government / Public Sector",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    industry: {
        header_name: "Industry",
        filter_key: "industry",
        columns: {
            customers: "industry"
        },
        order: 6,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Vertical industry sector",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        cell_mode: "text_code_1000",
        modal: {
            order: 6,
            horizontal_section: "h_section_1",
            required: false,
            error_note: "",
            info_note: "Industry sector (e.g. Retail, FinTech, Healthcare)"
        },
        filter_data: []
    },
    risk_level: {
        header_name: "Risk Level",
        filter_key: "risk_level",
        columns: {
            customers: "risk_level"
        },
        order: 7,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Calculated or assigned risk tier",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        cell_mode: "text_code_1000",
        modal: {
            order: 7,
            horizontal_section: "h_section_1",
            required: false,
            error_note: "",
            info_note: "Select risk assessment tier"
        },
        filter_data: [
          {
                    "key": "Low",
                    "name": "Low Risk",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Medium",
                    "name": "Medium Risk",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "High",
                    "name": "High Risk",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "Critical",
                    "name": "Critical Risk",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    email: {
        header_name: "Email",
        filter_key: "email",
        columns: {
            customers: "email"
        },
        order: 1,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Primary contact email address",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: "Primary billing or contact email"
        },
        filter_data: []
    },
    phone: {
        header_name: "Phone",
        filter_key: "phone",
        columns: {
            customers: "phone"
        },
        order: 2,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Primary telephone number",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: "Primary phone with country prefix"
        },
        filter_data: []
    },
    website: {
        header_name: "Website",
        filter_key: "website",
        columns: {
            customers: "website"
        },
        order: 3,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Company URL",
        elipsis: "text_elipsis",
        active: true,
        width: "200px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: "Corporate website URL"
        },
        filter_data: []
    },
    owner_name: {
        header_name: "Account Owner",
        filter_key: "owner_name",
        columns: {
            customers: "owner_name"
        },
        order: 4,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Internal account executive or manager",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        cell_mode: "text_code_1000",
        modal: {
            order: 4,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: "Assigned internal account executive"
        },
        filter_data: []
    },
    owner_email: {
        header_name: "Owner Email",
        filter_key: "owner_email",
        columns: {
            customers: "owner_email"
        },
        order: 5,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Email address of the account owner",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 5,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: "Account owner work email"
        },
        filter_data: []
    },
    country: {
        header_name: "Country",
        filter_key: "country",
        columns: {
            customers: "country"
        },
        order: 1,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Primary country of registration",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "",
            info_note: "Country name"
        },
        filter_data: []
    },
    country_code: {
        header_name: "Country Code",
        filter_key: "country_code",
        columns: {
            customers: "country_code"
        },
        order: 2,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "ISO 2-letter country code (e.g. US, IN, GB)",
        elipsis: "text_elipsis",
        active: true,
        width: "130px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "",
            info_note: "ISO 2-letter alpha code"
        },
        filter_data: []
    },
    city: {
        header_name: "City",
        filter_key: "city",
        columns: {
            customers: "city"
        },
        order: 3,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Registered city",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "",
            info_note: "City location"
        },
        filter_data: []
    },
    state: {
        header_name: "State / Province",
        filter_key: "state",
        columns: {
            customers: "state"
        },
        order: 4,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "State, province, or region",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        modal: {
            order: 4,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "",
            info_note: "State / province"
        },
        filter_data: []
    },
    postal_code: {
        header_name: "Postal Code",
        filter_key: "postal_code",
        columns: {
            customers: "postal_code"
        },
        order: 5,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Postal code or ZIP",
        elipsis: "text_elipsis",
        active: true,
        width: "130px",
        cell_mode: "text_code_1000",
        modal: {
            order: 5,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "",
            info_note: "ZIP / Postal code"
        },
        filter_data: []
    },
    address: {
        header_name: "Address",
        filter_key: "address",
        columns: {
            customers: "address"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: false,
        selected: true,
        column_resize: true,
        info_note: "Street address or headquarters line",
        elipsis: "text_elipsis",
        active: true,
        width: "260px",
        cell_mode: "text_code_1000",
        modal: {
            order: 6,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "",
            info_note: "Physical street address"
        },
        filter_data: []
    },
    annual_revenue: {
        header_name: "Annual Revenue",
        filter_key: "annual_revenue",
        columns: {
            customers: "annual_revenue"
        },
        order: 1,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Annual gross revenue in base currency",
        elipsis: "text_elipsis",
        active: true,
        width: "170px",
        cell_mode: "text_code_3000",
        modal: {
            order: 1,
            horizontal_section: "h_section_4",
            required: false,
            error_note: "",
            info_note: "Annual revenue number"
        },
        filter_data: []
    },
    currency: {
        header_name: "Currency",
        filter_key: "currency",
        columns: {
            customers: "currency"
        },
        order: 2,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "3-letter billing ISO currency code",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_4",
            required: false,
            error_note: "",
            info_note: "ISO currency code"
        },
        filter_data: [
          {
                    "key": "USD",
                    "name": "USD ($)",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "EUR",
                    "name": "EUR (€)",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "GBP",
                    "name": "GBP (£)",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "INR",
                    "name": "INR (₹)",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "CAD",
                    "name": "CAD ($)",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "AUD",
                    "name": "AUD ($)",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    employee_count: {
        header_name: "Employees",
        filter_key: "employee_count",
        columns: {
            customers: "employee_count"
        },
        order: 3,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Estimated workforce size",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        cell_mode: "text_code_3000",
        modal: {
            order: 3,
            horizontal_section: "h_section_4",
            required: false,
            error_note: "",
            info_note: "Total headcount"
        },
        filter_data: []
    },
    onboarding_date: {
        header_name: "Onboarding Date",
        filter_key: "onboarding_date",
        columns: {
            customers: "onboarding_date"
        },
        order: 4,
        filter_type: "date_range",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Date customer onboarding was completed",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "text_code_4000",
        modal: {
            order: 4,
            horizontal_section: "h_section_4",
            required: false,
            error_note: "",
            info_note: "Select onboarding date"
        },
        filter_data: []
    },
    last_activity_at: {
        header_name: "Last Activity",
        filter_key: "last_activity_at",
        columns: {
            customers: "last_activity_at"
        },
        order: 24,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Timestamp of most recent customer interaction",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        cell_mode: "text_code_4000",
        filter_data: []
    },
    is_active: {
        header_name: "Is Active",
        filter_key: "is_active",
        columns: {
            customers: "is_active"
        },
        order: 25,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Active flag for query filtering",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "text_code_1000",
        filter_data: [
          {
                    "key": "true",
                    "name": "Active (true)",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "false",
                    "name": "Inactive (false)",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    editable: {
        header_name: "Editable",
        filter_key: "editable",
        columns: {
            customers: "editable"
        },
        order: 26,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Controls whether row can be modified directly",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "text_code_1000",
        filter_data: [
          {
                    "key": "true",
                    "name": "Yes (true)",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "false",
                    "name": "No (false)",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    created_at: {
        header_name: "Created At",
        filter_key: "created_at",
        columns: {
            customers: "created_at"
        },
        order: 27,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "System creation timestamp",
        elipsis: "text_elipsis",
        active: true,
        width: "170px",
        cell_mode: "text_code_4000",
        filter_data: []
    },
    updated_at: {
        header_name: "Updated At",
        filter_key: "updated_at",
        columns: {
            customers: "updated_at"
        },
        order: 28,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "System last updated timestamp",
        elipsis: "text_elipsis",
        active: true,
        width: "170px",
        cell_mode: "text_code_4000",
        filter_data: []
    }
};

export const CustomerColumnOptionsConfig = {
    pin: {
        key: "pin",
        name: "pin",
        active: true,
        info_note: "Pin column to left freeze side or unpin"
    },
    readonly: {
        key: "readonly",
        name: "readonly",
        active: true,
        info_note: "Toggle column editable / readonly mode"
    },
    hide: {
        key: "hide",
        name: "hide",
        active: true,
        info_note: "Hide or show column in table view"
    }
};
