export interface SidebarDropdownOption {
    name: string;
    display_name: string;
    path: string;
    component?: string;
    icon?: string;
    info_note?: string;
    order: number;
    active: boolean;
}

export interface SidebarItem {
    name: string;
    display_name: string;
    path: string;
    component?: string;
    icon?: string;
    active: boolean;
    pinned?: boolean;
    section: string;
    order: number;
    clickable: boolean;
    on_click: boolean;
    has_dropdown: boolean;
    dropdown_default_value?: string;
    dropdown_options?: Record<string, SidebarDropdownOption>;
    info_note?: string;
}

export interface SidebarSection {
    id: string;
    name: string;
    display_name: string;
    component?: string;
    order: number;
    pinned?: boolean;
    active: boolean;
    collapsible?: boolean;
}

export const SidebarConfig = {
    sidebar_key: "app_main_sidebar_config",
    display_name: "Application Navigation",
    collapsible: true,
    default_collapsed: false,

    sections: {
        section_1: {
            id: "section_1",
            name: "User Section",
            display_name: "Section 1",
            component: "dropdown_sections_component",
            order: 1,
            pinned: true,
            active: true,
            collapsible: false
        },
        section_2: {
            id: "section_2",
            name: "Partner Section",
            display_name: "Section 2",
            component: "dropdown_sections_component",
            order: 2,
            pinned: true,
            active: true,
            collapsible: false
        }
    },

    items: {
        users: {
            name: "Users",
            display_name: "Users",
            path: "/users",
            component: "users_nav_component",
            icon: "users_icon",
            active: true,
            pinned: true,
            section: "section_1",
            order: 1,
            clickable: true,
            on_click: true,
            has_dropdown: true,
            dropdown_default_value: "all_users",
            info_note: "User management and access",
            dropdown_options: {
                all_users: {
                    name: "All Users",
                    display_name: "All Users",
                    path: "/users",
                    component: "all_users_component",
                    icon: "users_list_icon",
                    info_note: "View and manage all users",
                    order: 1,
                    active: true
                },
                active_users: {
                    name: "Active Users",
                    display_name: "Active Users",
                    path: "/users?status=active",
                    component: "active_users_component",
                    icon: "user_check_icon",
                    info_note: "Filter active users",
                    order: 2,
                    active: true
                },
                pending_users: {
                    name: "Pending Users",
                    display_name: "Pending Users",
                    path: "/users?status=pending",
                    component: "pending_users_component",
                    icon: "user_clock_icon",
                    info_note: "Filter pending users",
                    order: 3,
                    active: true
                },
                roles_permissions: {
                    name: "Roles & Permissions",
                    display_name: "Roles & Permissions",
                    path: "/users/roles",
                    component: "roles_permissions_component",
                    icon: "shield_icon",
                    info_note: "User roles and permission matrix",
                    order: 4,
                    active: true
                }
            }
        },

        clients: {
            name: "Clients",
            display_name: "Clients",
            path: "/clients",
            component: "clients_nav_component",
            icon: "clients_icon",
            active: true,
            pinned: true,
            section: "section_1",
            order: 2,
            clickable: true,
            on_click: true,
            has_dropdown: false,
            dropdown_options: {},
            info_note: "Client accounts and management"
        },

        partners: {
            name: "Partners",
            display_name: "Partners",
            path: "/partners",
            component: "partners_nav_component",
            icon: "partners_icon",
            active: true,
            pinned: true,
            section: "section_2",
            order: 1,
            clickable: true,
            on_click: true,
            has_dropdown: false,
            dropdown_options: {},
            info_note: "Partners, vendors, and affiliates"
        }
    },

    // Alias 'actions' for consistency with actions table configuration pattern
    get actions() {
        return this.items;
    }
};
