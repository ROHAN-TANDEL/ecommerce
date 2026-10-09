export const EmployeeColumnConfig = {
    first_name: {
        header_name: "First Name",
        filter_key: "first_name",
        columns: { employees: "first_name" },
        filter_type: "multi_search",
        editable: true,
        sorting: true,
        order: 1,
        column_resize: true,
        cell_mode: "text_code_1000",
        info_note: "Employee first name",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        modal: {
            order: 1,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "First Name is required",
            info_note: "Enter first name"
        },
        freez: { freez_side: "left", order: 1 },
        filter_data: []
    },
    last_name: {
        header_name: "Last Name",
        filter_key: "last_name",
        columns: { employees: "last_name" },
        filter_type: "search",
        editable: true,
        sorting: true,
        order: 2,
        column_resize: true,
        cell_mode: "text_code_1000",
        info_note: "Employee last name",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        modal: {
            order: 2,
            horizontal_section: "h_section_1",
            required: true,
            error_note: "Last Name is required",
            info_note: "Enter last name"
        },
        freez: { freez_side: "left", order: 2 },
        filter_data: []
    },
    email: {
        header_name: "Email",
        filter_key: "email",
        columns: { employees: "email" },
        filter_type: "search",
        editable: true,
        sorting: true,
        order: 3,
        column_resize: true,
        cell_mode: "text_code_2000",
        info_note: "Corporate email address",
        elipsis: "text_elipsis",
        active: true,
        width: "240px",
        modal: {
            order: 3,
            horizontal_section: "h_section_2",
            required: true,
            error_note: "Email is required",
            info_note: "Enter email"
        },
        filter_data: []
    },
    department: {
        header_name: "Department",
        filter_key: "department",
        columns: { employees: "department" },
        filter_type: "list",
        editable: true,
        sorting: true,
        order: 4,
        column_resize: true,
        cell_mode: "text_code_1000",
        info_note: "Department / Organization unit",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        modal: {
            order: 4,
            horizontal_section: "h_section_2",
            required: false,
            error_note: "Department is required",
            info_note: "Enter department"
        },
        filter_data: [
            { key: "active", name: "Active" },
            { key: "inactive", name: "Inactive" },
            { key: "pending", name: "Pending" }
        ]
    },
    role: {
        header_name: "Job Role",
        filter_key: "role",
        columns: { employees: "role" },
        filter_type: "search",
        editable: true,
        sorting: true,
        order: 5,
        column_resize: true,
        cell_mode: "text_code_1000",
        info_note: "Assigned job title",
        elipsis: "text_elipsis",
        active: true,
        width: "180px",
        modal: {
            order: 5,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "Job Role is required",
            info_note: "Enter job role"
        },
        filter_data: []
    },
    salary: {
        header_name: "Salary ($)",
        filter_key: "salary",
        columns: { employees: "salary" },
        filter_type: "number_range",
        editable: true,
        sorting: true,
        order: 6,
        column_resize: true,
        cell_mode: "text_code_3000",
        info_note: "Annual base compensation",
        elipsis: "text_elipsis",
        active: true,
        width: "150px",
        modal: {
            order: 6,
            horizontal_section: "h_section_3",
            required: false,
            error_note: "Salary ($) is required",
            info_note: "Enter salary ($)"
        },
        filter_data: []
    },
    status: {
        header_name: "Status",
        filter_key: "status",
        columns: { employees: "status" },
        filter_type: "list",
        editable: true,
        sorting: true,
        order: 7,
        column_resize: true,
        cell_mode: "text_code_1000",
        info_note: "Employee employment status",
        elipsis: "text_elipsis",
        active: true,
        width: "140px",
        modal: {
            order: 7,
            horizontal_section: "h_section_4",
            required: false,
            error_note: "Status is required",
            info_note: "Enter status"
        },
        filter_data: [
            { key: "active", name: "Active" },
            { key: "inactive", name: "Inactive" },
            { key: "pending", name: "Pending" }
        ]
    },
    hire_date: {
        header_name: "Hire Date",
        filter_key: "hire_date",
        columns: { employees: "hire_date" },
        filter_type: "date_range",
        editable: false,
        sorting: true,
        order: 8,
        column_resize: true,
        cell_mode: "text_code_4000",
        info_note: "Date employee onboarded",
        elipsis: "text_elipsis",
        active: true,
        width: "160px",
        modal: {
            order: 8,
            horizontal_section: "h_section_4",
            required: false,
            error_note: "Hire Date is required",
            info_note: "Enter hire date"
        },
        filter_data: []
    }
};

export const EmployeeColumnOptionsConfig = {
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
