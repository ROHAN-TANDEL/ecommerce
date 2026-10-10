export const ClientColumnConfig = {
    id: {
        header_name: "ID",
        filter_key: "id",
        columns: {
            clients: "id"
        },
        order: 1,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Client internal identifier",
        elipsis: "text_elipsis",
        active: true,
        width: "80px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    partner_name: {
        header_name: "Partner",
        filter_key: "partner_name",
        columns: {
            clients: "partner_name"
        },
        order: 2,
        filter_type: "search",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Managing partner / reseller organization",
        elipsis: "text_elipsis",
        active: true,
        width: "190px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    partner_id: {
        header_name: "Partner ID",
        filter_key: "partner_id",
        columns: {
            clients: "partner_id"
        },
        order: 1,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "ID of parent partner",
        elipsis: "text_elipsis",
        active: false,
        width: "120px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Select parent partner organization"
        },
        filter_data: []
    },
    client_code: {
        header_name: "Client Code",
        filter_key: "client_code",
        columns: {
            clients: "client_code"
        },
        order: 2,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Unique client reference code (e.g. CLI-LUMINA-101)",
        elipsis: "text_elipsis",
        active: true,
        width: "170px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Unique client identifier"
        },
        filter_data: []
    },
    client_name: {
        header_name: "Client Name",
        filter_key: "client_name",
        columns: {
            clients: "client_name"
        },
        order: 3,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Trade name of client business",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Client company name"
        },
        filter_data: []
    },
    domain: {
        header_name: "Domain / Host",
        filter_key: "domain",
        columns: {
            clients: "domain"
        },
        order: 4,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Custom domain or tenant hostname",
        elipsis: "text_elipsis",
        active: true,
        width: "200px",
        cell_mode: "text_code_1000",
        modal: {
            order: 4,
            horizontal_section: "h_section_1",
            required: false,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    industry: {
        header_name: "Industry",
        filter_key: "industry",
        columns: {
            clients: "industry"
        },
        order: 7,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Industry vertical",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: {
            clients: "status"
        },
        order: 5,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Tenant operating status",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "status_badge",
        modal: {
            order: 5,
            horizontal_section: "h_section_2",
            required: true,
            error_note: "",
            info_note: ""
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
                    "key": "PENDING",
                    "name": "Pending",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    user_count: {
        header_name: "Users",
        filter_key: "user_count",
        columns: {
            clients: "user_count"
        },
        order: 9,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Total active users in this tenant",
        elipsis: "text_elipsis",
        active: true,
        width: "100px",
        cell_mode: "badge_count",
        filter_data: []
    },
    product_count: {
        header_name: "Products",
        filter_key: "product_count",
        columns: {
            clients: "product_count"
        },
        order: 10,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Subscribed applications count",
        elipsis: "text_elipsis",
        active: true,
        width: "110px",
        cell_mode: "badge_count",
        filter_data: []
    },
    contact_person_name: {
        header_name: "Client Lead",
        filter_key: "contact_person_name",
        columns: {
            clients: "contact_person_name"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Primary client point of contact",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
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
    email: {
        header_name: "Email",
        filter_key: "email",
        columns: {
            clients: "email"
        },
        order: 7,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Administrative email address",
        elipsis: "text_elipsis",
        active: true,
        width: "200px",
        cell_mode: "text_code_2000",
        modal: {
            order: 7,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    max_users: {
        header_name: "Max Users",
        filter_key: "max_users",
        columns: {
            clients: "max_users"
        },
        order: 13,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Max licensed user seat limit",
        elipsis: "text_elipsis",
        active: true,
        width: "110px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    created_at: {
        header_name: "Created On",
        filter_key: "created_at",
        columns: {
            clients: "created_at"
        },
        order: 14,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Onboarding date",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "date_code_1000",
        filter_data: []
    }
};

export const ClientColumnOptionsConfig = {
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
