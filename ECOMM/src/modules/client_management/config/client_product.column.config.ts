export const ClientProductColumnConfig = {
    id: {
        header_name: "ID",
        filter_key: "id",
        columns: {
            client_products: "id"
        },
        order: 1,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Subscription record ID",
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
            client_products: "client_name"
        },
        order: 2,
        filter_type: "search",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Subscribed client business",
        elipsis: "text_elipsis",
        active: true,
        width: "200px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    client_id: {
        header_name: "Client ID",
        filter_key: "client_id",
        columns: {
            client_products: "client_id"
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
            info_note: "Select target client"
        },
        filter_data: []
    },
    product_name: {
        header_name: "Product",
        filter_key: "product_name",
        columns: {
            client_products: "product_name"
        },
        order: 4,
        filter_type: "search",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Assigned SaaS application",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    product_id: {
        header_name: "Product ID",
        filter_key: "product_id",
        columns: {
            client_products: "product_id"
        },
        order: 2,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Product ID",
        elipsis: "text_elipsis",
        active: false,
        width: "110px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Select SaaS product"
        },
        filter_data: []
    },
    license_type: {
        header_name: "License",
        filter_key: "license_type",
        columns: {
            client_products: "license_type"
        },
        order: 3,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "License package tier",
        elipsis: "text_elipsis",
        active: true,
        width: "130px",
        cell_mode: "text_code_1000",
        modal: {
            order: 3,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: ""
        },
        filter_data: [
          {
                    "key": "FREE_TRIAL",
                    "name": "Free Trial",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "STANDARD",
                    "name": "Standard",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "PRO",
                    "name": "Pro",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "ENTERPRISE",
                    "name": "Enterprise",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: {
            client_products: "status"
        },
        order: 4,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Subscription status",
        elipsis: "text_elipsis",
        active: true,
        width: "120px",
        cell_mode: "status_badge",
        modal: {
            order: 4,
            horizontal_section: "h_section_1",
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
                    "key": "EXPIRED",
                    "name": "Expired",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    max_seats: {
        header_name: "Max Seats",
        filter_key: "max_seats",
        columns: {
            client_products: "max_seats"
        },
        order: 5,
        filter_type: "numeric",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Licensed seats limit",
        elipsis: "text_elipsis",
        active: true,
        width: "110px",
        cell_mode: "text_code_1000",
        modal: {
            order: 5,
            horizontal_section: "h_section_2",
            required: true,
            error_note: "",
            info_note: ""
        },
        filter_data: []
    },
    allocated_seats: {
        header_name: "Used Seats",
        filter_key: "allocated_seats",
        columns: {
            client_products: "allocated_seats"
        },
        order: 9,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Currently assigned seats",
        elipsis: "text_elipsis",
        active: true,
        width: "110px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    external_tenant_id: {
        header_name: "External Tenant ID",
        filter_key: "external_tenant_id",
        columns: {
            client_products: "external_tenant_id"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Tenant slug / ID in external application",
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
    effective_launch_url: {
        header_name: "Launch URL",
        filter_key: "effective_launch_url",
        columns: {
            client_products: "effective_launch_url"
        },
        order: 11,
        filter_type: "search",
        editable: false,
        sorting: false,
        selected: true,
        column_resize: true,
        info_note: "Resolved application destination URL",
        elipsis: "text_elipsis",
        active: true,
        width: "240px",
        cell_mode: "text_code_2000",
        filter_data: []
    },
    valid_to: {
        header_name: "Expires On",
        filter_key: "valid_to",
        columns: {
            client_products: "valid_to"
        },
        order: 12,
        filter_type: "single_date",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Subscription expiry date",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "date_code_1000",
        filter_data: []
    }
};

export const ClientProductColumnOptionsConfig = {
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
