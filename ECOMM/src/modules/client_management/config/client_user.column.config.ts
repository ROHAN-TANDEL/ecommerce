export const ClientUserColumnConfig = {
    id: {
        header_name: "ID",
        filter_key: "id",
        columns: {
            client_users: "id"
        },
        order: 1,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "User identifier",
        elipsis: "text_elipsis",
        active: true,
        width: "80px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    client_name: {
        header_name: "Client Name",
        filter_key: "client_name",
        columns: {
            client_users: "client_name"
        },
        order: 2,
        filter_type: "search",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Employer client company",
        elipsis: "text_elipsis",
        active: true,
        width: "190px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    client_id: {
        header_name: "Client ID",
        filter_key: "client_id",
        columns: {
            client_users: "client_id"
        },
        order: 1,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Client ID",
        elipsis: "text_elipsis",
        active: false,
        width: "110px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Select target client organization"
        },
        filter_data: []
    },
    first_name: {
        header_name: "First Name",
        filter_key: "first_name",
        columns: {
            client_users: "first_name"
        },
        order: 2,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "User given name",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    last_name: {
        header_name: "Last Name",
        filter_key: "last_name",
        columns: {
            client_users: "last_name"
        },
        order: 3,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "User family name",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    email: {
        header_name: "Email",
        filter_key: "email",
        columns: {
            client_users: "email"
        },
        order: 4,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Business email address",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_2000",
        modal: {
            order: 4,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    role: {
        header_name: "Role",
        filter_key: "role",
        columns: {
            client_users: "role"
        },
        order: 5,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Authorization level within client",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        cell_mode: "text_code_1000",
        modal: {
            order: 5,
            horizontal_section: "h_section_2",
            required: true,
            error_note: "",
            info_note: ""
        },
        filter_data: [
          {
                    "key": "CLIENT_ADMIN",
                    "name": "Client Admin",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "CLIENT_MANAGER",
                    "name": "Client Manager",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "CLIENT_USER",
                    "name": "Client User",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "READ_ONLY",
                    "name": "Read Only",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    job_title: {
        header_name: "Job Title",
        filter_key: "job_title",
        columns: {
            client_users: "job_title"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Position / designation",
        elipsis: "text_elipsis",
        active: true,
        width: "170px",
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
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: {
            client_users: "status"
        },
        order: 7,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "User active status",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "status_badge",
        modal: {
            order: 7,
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
                    "key": "INVITED",
                    "name": "Invited",
                    "type": "check_box",
                    "default": false
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
          }
        ]
    },
    is_primary_contact: {
        header_name: "Primary Contact",
        filter_key: "is_primary_contact",
        columns: {
            client_users: "is_primary_contact"
        },
        order: 10,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Designated primary billing/technical contact",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        cell_mode: "boolean_pill",
        filter_data: []
    },
    created_at: {
        header_name: "Created On",
        filter_key: "created_at",
        columns: {
            client_users: "created_at"
        },
        order: 11,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Account onboarding timestamp",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "date_code_1000",
        filter_data: []
    }
};

export const ClientUserColumnOptionsConfig = {
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
