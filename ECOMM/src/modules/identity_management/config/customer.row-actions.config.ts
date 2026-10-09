export const CustomerRowActionsConfig = {
    actions: {
        refresh: {
            key: "refresh",
            name: "Refresh",
            active: true,
            info_note: "Reload row data from server",
            popup_component: "refresh_row_modal",
            api: "/identity/management/customers/:id",
            method: "GET",
            icon: "refresh",
            order: 1
        },
        view: {
            key: "view",
            name: "View",
            active: true,
            info_note: "View complete record details",
            popup_component: "view_record_modal",
            api: "/identity/management/customers/:id",
            method: "GET",
            icon: "eye",
            order: 2
        },
        pin: {
            key: "pin",
            name: "Pin / Unpin",
            active: true,
            info_note: "Pin row to top of table",
            popup_component: "pin_row_modal",
            api: "/identity/management/customers/update/:id",
            method: "PUT",
            icon: "pin",
            order: 3
        },
        lock: {
            key: "lock",
            name: "Lock / Unlock",
            active: true,
            info_note: "Prevent edits to this row",
            popup_component: "lock_row_modal",
            api: "/identity/management/customers/lock/rows",
            method: "POST",
            icon: "lock",
            order: 4
        },
        edit: {
            key: "edit",
            name: "Edit",
            active: true,
            info_note: "Edit details in modal form",
            popup_component: "edit_customer_modal",
            api: "/identity/management/customers/update/:id",
            method: "PUT",
            icon: "edit",
            order: 5
        },
        delete: {
            key: "delete",
            name: "Delete",
            active: true,
            info_note: "Delete record with confirmation",
            popup_component: "delete_confirm_modal",
            api: "/identity/management/customers/delete/:id",
            method: "DELETE",
            icon: "trash",
            order: 6
        }
    }
};
