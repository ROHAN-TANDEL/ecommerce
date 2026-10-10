export const PartnerColumnConfig = {
    id: {
        header_name: "ID",
        filter_key: "id",
        columns: {
            partners: "id"
        },
        order: 1,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Partner internal ID",
        elipsis: "text_elipsis",
        active: true,
        width: "90px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    partner_code: {
        header_name: "Partner Code",
        filter_key: "partner_code",
        columns: {
            partners: "partner_code"
        },
        order: 1,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Unique partner reference code (e.g. PTR-APEX-01)",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "Partner code is required",
            info_note: "Enter partner code"
        },
        filter_data: []
    },
    name: {
        header_name: "Partner Name",
        filter_key: "name",
        columns: {
            partners: "name"
        },
        order: 2,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Display trade name of the partner organization",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "Partner name is required",
            info_note: "Enter partner name"
        },
        filter_data: []
    },
    partner_tier: {
        header_name: "Tier",
        filter_key: "partner_tier",
        columns: {
            partners: "partner_tier"
        },
        order: 3,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Partner partnership tier level",
        elipsis: "text_elipsis",
        active: true,
        width: "130px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Select partner tier"
        },
        filter_data: [
          {
                    "key": "STANDARD",
                    "name": "Standard",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "SILVER",
                    "name": "Silver",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "GOLD",
                    "name": "Gold",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "PLATINUM",
                    "name": "Platinum",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "STRATEGIC",
                    "name": "Strategic",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: {
            partners: "status"
        },
        order: 4,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Account operational status",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "status_badge",
        modal: {
            order: 4,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Account status"
        },
        filter_data: [
          {
                    "key": "ACTIVE",
                    "name": "Active",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "INACTIVE",
                    "name": "Inactive",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "SUSPENDED",
                    "name": "Suspended",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "ONBOARDING",
                    "name": "Onboarding",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    client_count: {
        header_name: "Total Clients",
        filter_key: "client_count",
        columns: {
            partners: "client_count"
        },
        order: 6,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Number of active clients enrolled under this partner",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "badge_count",
        filter_data: []
    },
    email: {
        header_name: "Primary Email",
        filter_key: "email",
        columns: {
            partners: "email"
        },
        order: 5,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Partner organization contact email",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_2000",
        modal: {
            order: 5,
            horizontal_section: "h_section_2",
            required: true,
            error_note: "",
            info_note: "Enter partner contact email"
        },
        filter_data: []
    },
    phone: {
        header_name: "Phone",
        filter_key: "phone",
        columns: {
            partners: "phone"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: false,
        selected: true,
        column_resize: true,
        info_note: "Contact telephone number",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        modal: {
            order: 6,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    contact_person_name: {
        header_name: "Contact Lead",
        filter_key: "contact_person_name",
        columns: {
            partners: "contact_person_name"
        },
        order: 7,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Key account executive or manager",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        cell_mode: "text_code_1000",
        modal: {
            order: 7,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    billing_currency: {
        header_name: "Currency",
        filter_key: "billing_currency",
        columns: {
            partners: "billing_currency"
        },
        order: 10,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Billing currency code",
        elipsis: "text_elipsis",
        active: true,
        width: "100px",
        cell_mode: "text_code_1000",
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
          }
        ]
    },
    commission_rate: {
        header_name: "Commission (%)",
        filter_key: "commission_rate",
        columns: {
            partners: "commission_rate"
        },
        order: 11,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Reseller partner commission percentage",
        elipsis: "text_elipsis",
        active: true,
        width: "130px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    country: {
        header_name: "Country",
        filter_key: "country",
        columns: {
            partners: "country"
        },
        order: 12,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Country of operation",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    created_at: {
        header_name: "Created On",
        filter_key: "created_at",
        columns: {
            partners: "created_at"
        },
        order: 13,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Record creation timestamp",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "date_code_1000",
        filter_data: []
    }
};

export const PartnerColumnOptionsConfig = {
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
