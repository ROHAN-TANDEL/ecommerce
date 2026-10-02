export const UserColumnConfig = {
    first_name: {
        header_name: 'First Name',
        columns: { users: 'first_name' },
        filter_type: 'search',
        editable: true,
        sorting: true,
        info_note: 'User first name',
        elipsis: 'text_elipsis',
        active: true,
        show: true,
        master_edit_allow: true,
        freez : { freez_side : "left", order : 1 },
        filter_data: []
    },
    last_name: {
        header_name: 'Last Name',
        columns: { users: 'last_name' },
        filter_type: 'search',
        editable: true,
        sorting: true,
        info_note: 'User last name',
        elipsis: 'text_elipsis',
        active: true,
        show: true,
        master_edit_allow: true,
        freez : { freez_side : "left", order : 2 },
        filter_data: []
    },
    email: {
        header_name: 'Email',
        columns: { users: 'email' },
        filter_type: 'search',
        editable: true,
        sorting: true,
        info_note: 'User email address',
        elipsis: 'text_elipsis',
        active: true,
        show: true,
        master_edit_allow: true,
        filter_data: []
    },
    status: {
        header_name: 'Status',
        columns: { users: 'status' },
        filter_type: 'list',
        editable: true,
        sorting: true,
        info_note: 'Current user status',
        elipsis: 'text_elipsis',
        active: true,
        show: true,
        master_edit_allow: true,
        filter_data: [
            { key: 'active', name: 'Active', type: 'check_box', default: false },
            { key: 'inactive', name: 'Inactive', type: 'check_box', default: false },
            { key: 'pending', name: 'Pending', type: 'check_box', default: false }
        ]
    },
    created_at: {
        header_name: 'Registration Date',
        columns: { users: 'created_at' },
        filter_type: 'date_range',
        editable: false,
        sorting: true,
        info_note: 'Date user registered',
        elipsis: 'text_elipsis',
        active: true,
        show: true,
        master_edit_allow: false,
        filter_data: []
    }
};
