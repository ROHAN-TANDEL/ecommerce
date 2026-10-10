export const ProductColumnConfig = {
    id: {
        header_name: "ID",
        filter_key: "id",
        columns: {
            products: "id"
        },
        order: 1,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Internal product ID",
        elipsis: "text_elipsis",
        active: true,
        width: "80px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    product_code: {
        header_name: "Product Code",
        filter_key: "product_code",
        columns: {
            products: "product_code"
        },
        order: 1,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Identifier key (e.g. ECOMM, CRM, ANALYTICS)",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "text_code_1000",
        modal: {
            order: 1,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Unique application key"
        },
        filter_data: []
    },
    name: {
        header_name: "Product Name",
        filter_key: "name",
        columns: {
            products: "name"
        },
        order: 2,
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Application display title",
        elipsis: "text_elipsis",
        active: true,
        width: "220px",
        cell_mode: "text_code_1000",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "",
            info_note: "Name of the software application"
        },
        filter_data: []
    },
    category: {
        header_name: "Category",
        filter_key: "category",
        columns: {
            products: "category"
        },
        order: 3,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Product functional category",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
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
                    "key": "COMMERCE",
                    "name": "Commerce & Stores",
                    "type": "check_box",
                    "default": true
          },
          {
                    "key": "SALES_MARKETING",
                    "name": "Sales & CRM",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "BUSINESS_INTELLIGENCE",
                    "name": "Analytics & BI",
                    "type": "check_box",
                    "default": false
          },
          {
                    "key": "SUPPLY_CHAIN",
                    "name": "Inventory & Logistics",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: {
            products: "status"
        },
        order: 4,
        filter_type: "list",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Product release status",
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
                    "key": "BETA",
                    "name": "Beta",
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
                    "key": "DEPRECATED",
                    "name": "Deprecated",
                    "type": "check_box",
                    "default": false
          }
        ]
    },
    version: {
        header_name: "Version",
        filter_key: "version",
        columns: {
            products: "version"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Current deployed software version",
        elipsis: "text_elipsis",
        active: true,
        width: "100px",
        cell_mode: "text_code_1000",
        filter_data: []
    },
    external_launch_url: {
        header_name: "External Launch URL",
        filter_key: "external_launch_url",
        columns: {
            products: "external_launch_url"
        },
        order: 5,
        filter_type: "search",
        editable: true,
        sorting: false,
        selected: true,
        column_resize: true,
        info_note: "Base launch / redirection destination endpoint",
        elipsis: "text_elipsis",
        active: true,
        width: "260px",
        cell_mode: "text_code_2000",
        modal: {
            order: 5,
            horizontal_section: "h_section_2",
            required: true,
            error_note: "",
            info_note: "E.g. https://crm.nexora.io/launch"
        },
        filter_data: []
    },
    sso_client_id: {
        header_name: "SSO Client ID",
        filter_key: "sso_client_id",
        columns: {
            products: "sso_client_id"
        },
        order: 6,
        filter_type: "search",
        editable: true,
        sorting: false,
        selected: true,
        column_resize: true,
        info_note: "OAuth / OpenID SSO Client ID",
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
    subscribed_clients_count: {
        header_name: "Active Subscriptions",
        filter_key: "subscribed_clients_count",
        columns: {
            products: "subscribed_clients_count"
        },
        order: 9,
        filter_type: "numeric",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Clients currently entitled to this app",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        cell_mode: "badge_count",
        filter_data: []
    },
    created_at: {
        header_name: "Created On",
        filter_key: "created_at",
        columns: {
            products: "created_at"
        },
        order: 10,
        filter_type: "date_range",
        editable: false,
        sorting: true,
        selected: true,
        column_resize: true,
        info_note: "Product creation timestamp",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        cell_mode: "date_code_1000",
        filter_data: []
    }
};

export const ProductColumnOptionsConfig = {
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
