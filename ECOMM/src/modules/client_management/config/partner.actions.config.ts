export const PartnerActionsConfig = {
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
        },
        section_6: {
            name: "Themes",
            component: "dropdown_sections_component",
            order: 6,
            pinned: true
        }
    },
    actions: {
        themes: {
            name: "Themes",
            active: true,
            pinned: false,
            component: "theme_component",
            info_note: "set themes",
            dropdown_options: {
                dark: {
                    display_name: "Dark",
                    info_note: "add dark theme"
                },
                light: {
                    display_name: "Light",
                    info_note: "add light theme"
                },
                colorful: {
                    display_name: "colorful",
                    info_note: "add colorful theme"
                },
                grey: {
                    display_name: "grey",
                    info_note: "add grey them"
                }
            },
            section: "section_6",
            order: 8
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
        "delete": {
            name: "Delete",
            active: true,
            pinned: true,
            component: "delete_component",
            info_note: "Delete selected rows",
            section: "section_1",
            order: 3
        },
        enable: {
            name: "Enable",
            active: true,
            pinned: false,
            component: "enable_component",
            info_note: "Enable selected rows",
            section: "section_1",
            order: 4
        },
        disable: {
            name: "Disable",
            active: true,
            pinned: false,
            component: "disable_component",
            info_note: "Disable selected rows",
            section: "section_1",
            order: 5
        },
        revert: {
            name: "Revert",
            active: true,
            pinned: false,
            component: "revert_component",
            info_note: "Revert selected rows",
            section: "section_2",
            order: 3
        },
        expand: {
            name: "Expand",
            active: true,
            pinned: false,
            component: "expand_component",
            info_note: "Expand selected rows",
            section: "section_1",
            order: 6
        },
        copy: {
            name: "Copy",
            active: true,
            pinned: false,
            component: "copy_component",
            info_note: "Copy selected rows",
            section: "section_1",
            order: 7
        },
        reset: {
            name: "Reset",
            active: true,
            pinned: false,
            component: "reset_component",
            info_note: "reset & clear all the filters",
            section: "section_3",
            order: 1
        },
        export: {
            name: "Export",
            active: true,
            pinned: false,
            component: "export_component",
            info_note: "Export rows",
            dropdown_options: {
                excel: {
                    display_name: "excel .xlsx",
                    info_note: "download max 10k rows"
                },
                csv: {
                    display_name: "csv download",
                    info_note: "csv download"
                }
            },
            section: "section_4",
            order: 8
        },
        download: {
            name: "Download",
            active: true,
            pinned: false,
            component: "download_component",
            info_note: "Download data",
            dropdown_options: {
                excel: {
                    display_name: "excel .xlsx",
                    info_note: "download max 10k rows"
                },
                csv: {
                    display_name: "csv download",
                    info_note: "csv download"
                }
            },
            section: "section_4",
            order: 9
        },
        fullscreen: {
            name: "Full Screen",
            active: true,
            pinned: false,
            component: "fullscreen_component",
            info_note: "Maximize & Minimize table",
            section: "section_2",
            order: 10
        },
        collapse: {
            name: "Collapse",
            active: true,
            pinned: true,
            component: "collapse_component",
            info_note: "Collapse rows",
            section: "section_2",
            order: 11
        },
        view: {
            name: "View",
            active: true,
            pinned: false,
            component: "view_component",
            info_note: "load saved filters",
            dropdown_default_value: "default_view",
            dynamic_dropdown: true,
            dropdown_options: {
                default_view: {
                    display_name: "Default"
                },
                current_view: {
                    display_name: "Save current view"
                },
                delete_view: {
                    display_name: "Delete current view"
                }
            },
            section: "section_2",
            order: 12
        },
        density: {
            name: "Density",
            pinned: false,
            component: "density_component",
            active: true,
            info_note: "Adjust spacing between rows",
            dropdown_default_value: "comfortable",
            dropdown_options: {
                comfortable: {
                    info_note: "Adjust spacing between rows",
                    display_name: "Comfortable"
                },
                spacious: {
                    info_note: "Adjust spacing between rows",
                    display_name: "Spacious"
                },
                compact: {
                    info_note: "Adjust spacing between rows",
                    display_name: "Compact"
                }
            },
            section: "section_2",
            order: 14
        },
        columns: {
            name: "Columns",
            component: "column_component",
            active: true,
            pinned: false,
            info_note: "Columns view, reorder & configuration",
            dynamic_dropdown: true,
            section: "section_3",
            order: 1
        },
        scroller: {
            name: "",
            active: true,
            pinned: false,
            component: "scroller_component",
            info_note: "Scroller horizontally",
            section: "section_3",
            order: 2
        },
        live: {
            name: "Live",
            component: "live_component_option",
            active: true,
            info_note: "Show live panel feed",
            pinned: false,
            section: "section_3",
            order: 3
        },
        ai_summary: {
            name: "AI Summary",
            component: "live_component_option",
            active: true,
            info_note: "Selected Row/s level summary",
            pinned: false,
            section: "section_5",
            order: 1
        },
        prevalidate_data: {
            name: "Pre Validate",
            component: "live_component_option",
            active: true,
            info_note: "Prevalidate the data",
            pinned: false,
            section: "section_5",
            order: 2
        },
        generate_view: {
            name: "Gen / Store Views",
            component: "live_component_option",
            active: true,
            info_note: "Generate & store Views",
            pinned: false,
            section: "section_5",
            order: 3
        },
        ai_chat: {
            name: "Interact with AI",
            component: "live_component_option",
            active: true,
            info_note: "Interact with AI",
            pinned: false,
            section: "section_5",
            order: 4
        },
        ai_data_reviewed: {
            name: "Reviewed",
            component: "live_component_option",
            active: true,
            info_note: "Mark rows as reviewed",
            pinned: false,
            section: "section_5",
            order: 5
        }
    }
};
