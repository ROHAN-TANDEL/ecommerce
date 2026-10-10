export const UserRowActionsConfig = {
    active: true,
    actions: {
        refresh: {
            key: "refresh",
            name: "Refresh",
            active: true,
            info_note: "Refresh only this row from database",
            api: "/identity/management/users/:id",
            method: "GET",
            icon: "refresh",
            pinned:true,
            icon_only:true,
            order: 1
        },
        disable: {
            key: "disable",
            name: "Disable / Enable",
            active: true,
            info_note: "Toggle active / inactive status for this row",
            api: "/identity/management/users/update/:id",
            method: "PUT",
            icon: "ban",
            pinned:true,
            icon_only:true,
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
            popup_component: "view_row_modal",
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
            api: "/identity/management/users/lock/rows",
            method: "POST",
            icon: "lock",
            order: 6
        },
        edit: {
            key: "edit",
            name: "Edit",
            active: true,
            info_note: "Edit user details in modal form",
            popup_component: "edit_user_modal",
            api: "/identity/management/users/update/:id",
            method: "PUT",
            icon: "edit",
            order: 7
        },
        delete: {
            key: "delete",
            name: "Delete",
            active: true,
            info_note: "Delete user record with confirmation",
            popup_component: "delete_confirm_modal",
            api: "/identity/management/users/delete/:id",
            method: "DELETE",
            icon_only:true,
            icon: "trash",
            order: 8
        }
    }
};
