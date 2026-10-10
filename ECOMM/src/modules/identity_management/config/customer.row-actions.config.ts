export const CustomerRowActionsConfig = {
    active: true,
    actions: {
        refresh: {
            key: "refresh",
            name: "Refresh",
            active: true,
            info_note: "Refresh only this row from database",
            api: "/identity/management/customers/:id",
            method: "GET",
            icon: "refresh",
            order: 1
        },
        disable: {
            key: "disable",
            name: "Disable / Enable",
            active: true,
            info_note: "Toggle active / inactive status for this row",
            api: "/identity/management/customers/update/:id",
            method: "PUT",
            icon: "ban",
            order: 2
        },
        revert: {
            key: "revert",
            name: "Revert",
            active: true,
            info_note: "Revert row edits back to original baseline",
            icon: "undo",
            order: 3
        },
        view: {
            key: "view",
            name: "View",
            active: true,
            info_note: "Open view details popup modal",
            popup_component: "view_customer_modal",
            api: "/identity/management/customers/:id",
            method: "GET",
            icon: "eye",
            order: 4
        },
        pin: {
            key: "pin / unpin",
            name: "Pin / Unpin",
            active: true,
            info_note: "Pin row to top or unpin",
            icon: "pin",
            order: 5
        },
        lock: {
            key: "lock",
            name: "Lock",
            active: true,
            info_note: "Lock or unlock this row for editing",
            api: "/identity/management/customers/lock/rows",
            method: "POST",
            icon: "lock",
            order: 6
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
            order: 7
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
            order: 8
        }
    }
};
