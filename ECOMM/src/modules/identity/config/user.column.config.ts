export const UserColumnConfig = {
    first_name: {
        header_name: 'First Name',
        filter_key : 'first_name',
        columns: {
            users: 'first_name'
        },
        order : 1,
        modal : {
            order : 1,
            horizontal_section : 'h_section_1',
            required : true,
            error_note : "First name is required",
            info_note : "enter user name"
        },
        filter_type: 'multi_search',
        editable: true,
        sorting: true,
        selected : true,
        column_resize : true,
        info_note: 'User first name',
        elipsis: 'text_elipsis',
        active: true,
        freez : {
            freez_side : "left",
            order : 1
        },
        cell_mode : "text_code_1000",
        filter_data: []
    },
    last_name: {
        header_name: 'Last Name',
        filter_key : 'last_name',
        columns: { users: 'last_name' },
        filter_type: 'search',
        selected : true,
        editable: false,
        modal : {
            order : 2,
            horizontal_section : 'h_section_1',
            required : true,
            error_note : "First name is required",
            info_note : "enter user name"
        },
        order : 2,
        sorting: true,
        info_note: 'User last name',
        elipsis: 'text_elipsis',
        active: true,
        column_resize : true,
        cell_mode : "text_code_1000",
        freez : {
            freez_side : "left",
            order : 2
        },
        filter_data: []
    },
    email: {
        header_name: 'Email',
        filter_key : 'user_email',
        columns: { users: 'email' },
        filter_type: 'search',
        selected : true,
        editable: true,
        modal : {
            order : 2,
            horizontal_section : 'h_section_2',
            required : true,
            error_note : "First name is required",
            info_note : "enter user name"
        },
        sorting: true,
        info_note: 'User email address',
        elipsis: 'text_elipsis',
        active: true,
        order : 3,
        cell_mode : "text_code_2000",
        column_resize : true,
        filter_data: []
    },
    status: {
        header_name: 'Status',
        filter_key : 'user_name',
        columns: { users: 'status' },
        filter_type: 'list',
        editable: true,
        selected : true,
        modal : {
            order : 2,
            horizontal_section : 'h_section_3',
            required : true,
            error_note : "status is required",
            info_note : "enter user status"
        },
        sorting: true,
        info_note: 'Current user status',
        elipsis: 'text_elipsis',
        cell_mode : "text_code_3100",
        active: true,
        order: 4,
        column_resize : true,
        filter_data: [
            { key: 'active', name: 'Active', type: 'check_box', default: false },
            { key: 'inactive', name: 'Inactive', type: 'check_box', default: false },
            { key: 'pending', name: 'Pending', type: 'check_box', default: false }
        ]
    },
    created_at: {
        filter_key : 'user_created_at',
        header_name: 'Registration Date',
        columns: { users: 'created_at' },
        filter_type: 'date_range',
        editable: false,
        selected : false,
        column_resize : true,
        cell_mode : "text_code_4000",
        sorting: true,
        order : 5,
        info_note: 'Date user registered',
        elipsis: 'text_elipsis',
        active: true,
        filter_data: []
    }
};
