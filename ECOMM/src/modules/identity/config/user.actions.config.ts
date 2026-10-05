export const UserActionsConfig = {
    sections: {
        section_1: {
            name: "Actions",
            component: "dropdown_sections_component",
            order: 1
        },
        section_2: {
            name: "Views",
            component: "dropdown_sections_component",
            order: 2
        },
        section_3: {
            name: "More",
            component: "dropdown_sections_component",
            order: 3
        }
    },

    actions: {
        refresh: {
            name: "Refresh",
            component: "refresh_component",
            active: true,
            info_note: "",
            pinned: true,
            section: "section_2",
            order: 1
        },

        lock: {
            name: "Lock",
            active: true,
            component: "lock_component",
            pinned: true,
            info_note: "",
            section: "section_2",
            order: 2
        },

        edit: {
            name: "Edit",
            active: true,
            component: "edit_component",
            pinned: true,
            info_note: "",
            section: "section_1",
            order: 1
        },

        save: {
            name: "Save",
            active: true,
            component: "save_component",
            pinned: true,
            info_note: "",
            section: "section_1",
            order: 2
        },

        delete: {
            name: "Delete",
            active: true,
            component: "delete_component",
            info_note: "",
            section: "section_1",
            order: 3
        },

        enable: {
            name: "Enable",
            active: true,
            component: "enable_component",
            info_note: "",
            section: "section_1",
            order: 4
        },

        disable: {
            name: "Disable",
            active: true,
            component: "disable_component",
            info_note: "",
            section: "section_1",
            order: 5
        },

        revert: {
            name: "Revert",
            active: true,
            component: "revert_component",
            info_note: "",
            section: "section_2",
            order: 3
        },

        expand: {
            name: "Expand",
            active: true,
            component: "expand_component",
            info_note: "",
            section: "section_1",
            order: 6
        },

        copy: {
            name: "Copy",
            active: true,
            component: "copy_component",
            info_note: "",
            section: "section_1",
            order: 7
        },

        reset: {
            name: "Reset",
            active: true,
            component: "reset_component",
            info_note: "",
            section: "section_3",
            order: 1
        },

        export: {
            name: "Export",
            active: true,
            component: "export_component",
            info_note: "",
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
            section: "section_1",
            order: 8
        },

        download: {
            name: "Download",
            active: true,
            component: "download_component",
            info_note: "",
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
            section: "section_1",
            order: 9
        },

        fullscreen: {
            name: "Full Screen",
            active: true,
            component: "fullscreen_component",
            info_note: "",
            section: "section_2",
            order: 10
        },

        collapse: {
            name: "Collapse",
            active: true,
            component: "collapse_component",
            info_note: "",
            section: "section_2",
            order: 11
        },

        view: {
            name: "View",
            active: true,
            component: "view_component",
            info_note: "",
            dropdown_default_value: "default_view",
            dropdown_options: {
                default_view: {
                    display_name: "Default"
                },
                current_view: {
                    display_name: "Save current view"
                },
                reset_view: {
                    display_name: "Reset view"
                }
            },
            section: "section_2",
            order: 12
        },

        density: {
            name: "Density",
            component: "density_component",
            active: true,
            info_note: "",
            dropdown_default_value: "comfortable",
            dropdown_options: {
                comfortable: {
                    display_name: "Comfortable"
                },
                spacious: {
                    display_name: "Spacious"
                },
                compact: {
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
            info_note: "",
            dynamic_dropdown: true,
            section: "section_3",
            order: 1
        },

        scroller: {
            name: "",
            active: true,
            component: "scroller_component",
            info_note: "",
            section: "section_3",
            order: 2
        },

        live: {
            name: "Live",
            component: "live_component_option",
            active: true,
            info_note: "",
            section: "section_3",
            order: 3
        }
    }
};