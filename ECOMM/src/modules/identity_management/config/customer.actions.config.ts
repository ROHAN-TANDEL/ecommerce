export const CustomerActionsConfig = {
    sections: {
        section_1: {
            name: "Actions",
            component: "dropdown_sections_component",
            order: 1,
            pinned: true
        },
        section_2: {
            name: "Views",
            component: "dropdown_sections_component",
            order: 2,
            pinned: true
        },
        section_3: {
            name: "More",
            component: "dropdown_sections_component",
            order: 3,
            pinned: true
        },
        section_4: {
            name: "Exports",
            component: "dropdown_sections_component",
            order: 4,
            pinned: true
        },
        section_5: {
            name: "AI",
            component: "dropdown_sections_component",
            order: 5,
            pinned: true
        }
    },
    actions: {
        ai_summary: {
            name: "AI Summary",
            component: "action_btn_component",
            active: true,
            info_note: "Selected Row/s level summary",
            pinned: false,
            section: "section_5",
            order: 1
        },
        ai_chat: {
            name: "Interact with AI",
            component: "action_btn_component",
            active: true,
            info_note: "Interact with table using AI assistant",
            pinned: false,
            section: "section_5",
            order: 2
        },
        ai_data_reviewed: {
            name: "Mark All Reviewed",
            component: "action_btn_component",
            active: true,
            info_note: "Mark all AI altered rows as reviewed",
            pinned: false,
            section: "section_5",
            order: 3
        },
        refresh: {
            name: "Refresh",
            component: "refresh_component",
            active: true,
            info_note: "Refresh rows",
            pinned: true,
            section: "section_2",
            order: 1
        },
        lock: {
            name: "Lock",
            active: true,
            component: "lock_component",
            pinned: true,
            info_note: "Lock table for 60s",
            section: "section_2",
            order: 2
        },
        edit: {
            name: "Edit",
            active: true,
            component: "edit_component",
            pinned: true,
            info_note: "Edit selected rows",
            section: "section_1",
            order: 1
        },
        save: {
            name: "Save",
            active: true,
            component: "save_component",
            pinned: true,
            info_note: "Save rows",
            section: "section_1",
            order: 2
        },
        delete: {
            name: "Delete",
            active: true,
            component: "delete_component",
            info_note: "Delete selected rows",
            section: "section_1",
            order: 3
        },
        enable: {
            name: "Enable",
            active: true,
            component: "enable_component",
            info_note: "Enable selected rows",
            section: "section_1",
            order: 4
        },
        disable: {
            name: "Disable",
            active: true,
            component: "disable_component",
            info_note: "Disable selected rows",
            section: "section_1",
            order: 5
        },
        revert: {
            name: "Revert",
            active: true,
            component: "revert_component",
            info_note: "Revert selected rows",
            section: "section_2",
            order: 3
        },
        copy: {
            name: "Copy",
            active: true,
            component: "copy_component",
            info_note: "Copy selected rows",
            section: "section_1",
            order: 7
        },
        reset: {
            name: "Reset",
            active: true,
            component: "reset_component",
            info_note: "Reset & clear all filters",
            section: "section_3",
            order: 1
        },
        export: {
            name: "Export",
            active: true,
            component: "export_component",
            info_note: "Export rows",
            dropdown_options: {
                excel: { display_name: "Excel .xlsx", info_note: "download max 10k rows" },
                csv: { display_name: "CSV Download", info_note: "csv download" }
            },
            section: "section_4",
            order: 8
        },
        download: {
            name: "Download",
            active: true,
            component: "download_component",
            info_note: "Download data",
            dropdown_options: {
                excel: { display_name: "Excel .xlsx", info_note: "download max 10k rows" },
                csv: { display_name: "CSV Download", info_note: "csv download" }
            },
            section: "section_4",
            order: 9
        },
        view: {
            name: "View",
            active: true,
            component: "view_component",
            info_note: "Load saved filters",
            dropdown_default_value: "default_view",
            dynamic_dropdown: true,
            dropdown_options: {
                default_view: { display_name: "Default" },
                current_view: { display_name: "Save current view" },
                delete_view: { display_name: "Delete current view" }
            },
            section: "section_2",
            order: 12
        },
        density: {
            name: "Density",
            component: "density_component",
            active: true,
            info_note: "Adjust spacing between rows",
            dropdown_default_value: "comfortable",
            dropdown_options: {
                comfortable: { display_name: "Comfortable" },
                spacious: { display_name: "Spacious" },
                compact: { display_name: "Compact" }
            },
            section: "section_2",
            order: 14
        },
        columns: {
            name: "Columns",
            component: "column_component",
            active: true,
            info_note: "Columns view, reorder & configuration",
            dynamic_dropdown: true,
            section: "section_3",
            order: 1
        },
        scroller: {
            name: "Scroller",
            active: true,
            component: "scroller_component",
            info_note: "Horizontal scroller",
            pinned: false,
            section: "section_3",
            order: 2
        },
        live: {
            name: "Live",
            component: "live_component_option",
            active: true,
            info_note: "Show live panel feed",
            pinned: true,
            section: "section_3",
            order: 3
        }
    }
};
