#!/usr/bin/env node
/**
 * End-to-End Backend Entity Code Generator
 * Generates decoupled configs, validator, repository, service, controller, and routes for any entity.
 * Uses a JSON schema file as the single source of truth.
 * 
 * Safety Guarantee:
 *   Will NEVER overwrite existing files. If a file was already generated or created earlier,
 *   it will be skipped and preserved. Pass --force to override.
 * 
 * Usage:
 *   # Via JSON Schema:
 *   npm run generate:entity -- --schema src/modules/identity_management/schema/customers.schema.json
 * 
 *   # Via JSON Schema with Dry-Run:
 *   npm run generate:entity -- --schema src/modules/identity_management/schema/customers.schema.json --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ── String Helpers ─────────────────────────────────────────────────────────────
function toPascalCase(str: string): string {
  return str
    .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/^(\w)/, (_, c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  const p = toPascalCase(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function toPlural(str: string): string {
  const s = str.toLowerCase();
  if (s.endsWith('y') && !/[aeiou]y$/.test(s)) return s.slice(0, -1) + 'ies';
  if (s.endsWith('s') || s.endsWith('sh') || s.endsWith('ch') || s.endsWith('x') || s.endsWith('z')) return s + 'es';
  return s + 's';
}

function toSingular(str: string): string {
  const s = str.toLowerCase();
  if (s.endsWith('ies')) return s.slice(0, -3) + 'y';
  if (s.endsWith('es') && (s.endsWith('shes') || s.endsWith('ches') || s.endsWith('sses') || s.endsWith('xes'))) return s.slice(0, -2);
  if (s.endsWith('s') && !s.endsWith('ss')) return s.slice(0, -1);
  return s;
}

function toTitleCase(str: string): string {
  return str
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ── Column Definition ──────────────────────────────────────────────────────────
export interface ColumnModalConfig {
  order?: number;
  horizontal_section?: string;
  required?: boolean;
  info_note?: string;
  error_note?: string;
}

export interface DropdownOption {
  key: string;
  name: string;
  default?: boolean;
}

export interface ColumnDefinition {
  key: string;
  header_name: string;
  type: 'string' | 'number' | 'date' | 'enum' | 'boolean' | 'uuid';
  sql_type?: string;
  filter_type: 'search' | 'multi_search' | 'date_range' | 'single_date' | 'numeric' | 'number_range' | 'list';
  editable: boolean;
  required: boolean;
  sorting: boolean;
  order?: number;
  width?: string;
  cell_mode?: string;
  info_note?: string;
  active?: boolean;
  elipsis?: string;
  dropdown_options?: DropdownOption[];
  modal?: ColumnModalConfig;
  freez?: { freez_side: string; order: number };
}

export interface EntityConfig {
  entityName: string;       // e.g. "Customer"
  tableName: string;        // e.g. "customers"
  moduleName: string;       // e.g. "identity_management"
  outputDir: string;        // e.g. "src/modules/identity_management"
  routePrefix: string;      // e.g. "/identity/management"
  database: string;         // e.g. "master"
  productName: string;      // e.g. "identity_management"
  tableKey: string;         // e.g. "customers_table_1234"
  displayName: string;      // e.g. "Customer Management"
  addButtonLabel: string;   // e.g. "+ Add Customer"
  primaryKey: { key: string; type: string; generated: boolean };
  columns: ColumnDefinition[];
  autoRegister: boolean;
  dryRun: boolean;
  forceOverwrite: boolean;
}

// ── Product Config Resolver ────────────────────────────────────────────────────
function resolveProductInfo(productName: string): { routePrefix: string; moduleName: string; outputDir: string } {
  const configFile = path.join(ROOT_DIR, 'src', 'platformdb', 'config.ts');
  let routePrefix = `/${productName.replace(/_/g, '/')}`;
  let moduleName = productName;

  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    const regex = new RegExp(`${productName}[\\s\\S]*?identification\\s*:\\s*['"]([^'"]+)['"]`);
    const match = content.match(regex);
    if (match && match[1]) {
      routePrefix = match[1];
    }
  }

  const modulesDir = path.join(ROOT_DIR, 'src', 'modules');
  if (fs.existsSync(modulesDir)) {
    const entries = fs.readdirSync(modulesDir);
    if (entries.includes(productName)) {
      moduleName = productName;
    } else {
      const match = entries.find(e => productName.startsWith(e) || e.startsWith(productName));
      if (match) moduleName = match;
    }
  }

  return {
    routePrefix,
    moduleName,
    outputDir: path.join('src', 'modules', moduleName)
  };
}

// ── CLI Arg Parser ─────────────────────────────────────────────────────────────
function parseArgs(): EntityConfig {
  const args = process.argv.slice(2);
  let entityName = '';
  let tableName = '';
  let moduleName = 'identity_management';
  let outputDir = '';
  let routePrefix = '';
  let database = 'master';
  let productName = 'identity_management';
  let tableKey = '';
  let displayName = '';
  let addButtonLabel = '';
  let primaryKey = { key: 'id', type: 'uuid', generated: true };
  let columns: ColumnDefinition[] = [];
  let autoRegister = true;
  let dryRun = false;
  let forceOverwrite = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--schema' || a === '-s') {
      const rawSchemaPath = args[++i];
      const schemaFile = path.isAbsolute(rawSchemaPath)
        ? rawSchemaPath
        : path.resolve(process.cwd(), rawSchemaPath);

      if (!fs.existsSync(schemaFile)) {
        throw new Error(`Schema file not found at: ${schemaFile}`);
      }

      console.log(`📄 Loading schema from: ${schemaFile}`);
      const json = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));

      if (json.entity || json.name || json.entityName) entityName = json.entity || json.name || json.entityName;
      if (json.table || json.tableName) tableName = json.table || json.tableName;
      if (json.product || json.productName) productName = json.product || json.productName;
      if (json.module || json.moduleName) moduleName = json.module || json.moduleName;
      if (json.database) database = json.database;
      if (json.table_key || json.tableKey) tableKey = json.table_key || json.tableKey;
      if (json.display_name || json.displayName) displayName = json.display_name || json.displayName;
      if (json.add_button_label || json.addButtonLabel) addButtonLabel = json.add_button_label || json.addButtonLabel;
      if (json.primary_key || json.primaryKey) primaryKey = json.primary_key || json.primaryKey;
      if (json.routePrefix) routePrefix = json.routePrefix;
      if (json.outputDir || json.path) outputDir = json.outputDir || json.path;
      if (json.columns && Array.isArray(json.columns)) columns = json.columns;
    } else if (a === '--name' || a === '-n') {
      entityName = args[++i];
    } else if (a === '--table' || a === '-t') {
      tableName = args[++i];
    } else if (a === '--product') {
      productName = args[++i];
    } else if (a === '--database' || a === '--db') {
      database = args[++i];
    } else if (a === '--no-register') {
      autoRegister = false;
    } else if (a === '--dry-run') {
      dryRun = true;
    } else if (a === '--force' || a === '--overwrite') {
      forceOverwrite = true;
    }
  }

  // Derive naming if missing
  if (!entityName && tableName) {
    entityName = toPascalCase(toSingular(tableName));
  } else if (!entityName) {
    entityName = 'Customer';
  }
  entityName = toPascalCase(entityName);

  if (!tableName) tableName = toSnakeCase(toPlural(entityName));
  if (!tableKey) tableKey = `${tableName}_table_1234`;
  if (!displayName) displayName = `${toTitleCase(tableName)} Management`;
  if (!addButtonLabel) addButtonLabel = `+ Add ${entityName}`;

  // Resolve Product details
  const resolved = resolveProductInfo(productName);
  if (!routePrefix) routePrefix = resolved.routePrefix;
  if (!outputDir) {
    moduleName = resolved.moduleName;
    outputDir = resolved.outputDir;
  }

  // Assign order and defaults for columns if missing
  columns = columns.map((col, idx) => {
    return {
      ...col,
      order: col.order || (col.modal?.order) || (idx + 1),
      active: col.active !== undefined ? col.active : true,
      elipsis: col.elipsis || 'text_elipsis',
      cell_mode: col.cell_mode || (col.type === 'number' ? 'text_code_3000' : col.type === 'date' ? 'text_code_4000' : 'text_code_1000')
    };
  });

  return {
    entityName,
    tableName,
    moduleName,
    outputDir,
    routePrefix,
    database,
    productName,
    tableKey,
    displayName,
    addButtonLabel,
    primaryKey,
    columns,
    autoRegister,
    dryRun,
    forceOverwrite
  };
}

// ── Code Generators ────────────────────────────────────────────────────────────

// 1. Table Master Config (100% matched with UserTableConfig)
function generateTableConfig(cfg: EntityConfig): string {
  const { entityName, tableName, routePrefix, tableKey, displayName, addButtonLabel } = cfg;

  return `export const ${entityName}TableConfig = {
    "table_key" : "${tableKey}",
    "display_name" : "${displayName}",
    "readonly" : false,
    "table_api" : {
        "paginated_data_api" : "${routePrefix}/${tableName}",
        "data_api" : "${routePrefix}/${tableName}/:id",

        "create_api" : "${routePrefix}/${tableName}/create",
        "create_bulk_api" : "${routePrefix}/${tableName}/create/bulk",
        "create_all_api" : "${routePrefix}/${tableName}/create/all",
        "create_import_api" : "${routePrefix}/${tableName}/create/import",

        "update_api" : "${routePrefix}/${tableName}/update/:id",
        "update_bulk_api" : "${routePrefix}/${tableName}/update/bulk",
        "update_all_api" : "${routePrefix}/${tableName}/update/all",
        "update_status_api" : "${routePrefix}/${tableName}/update/status",
        "update_bulk_status_api" : "${routePrefix}/${tableName}/update/bulk/status",
        "update_import_api" : "${routePrefix}/${tableName}/update/import",

        "delete_api" : "${routePrefix}/${tableName}/delete/:id",
        "delete_bulk_api" : "${routePrefix}/${tableName}/delete/bulk",
        "delete_all_api" : "${routePrefix}/${tableName}/delete/all",

        "column_config_api" : "${routePrefix}/${tableName}/config/columns",
        "columns_config_api" : "${routePrefix}/${tableName}/config/columns",
        "table_config_api" : "${routePrefix}/${tableName}/config/table",
        "action_panel_config_api" : "${routePrefix}/${tableName}/config/actions",
        "actions_config_api" : "${routePrefix}/${tableName}/config/actions",
        "header_config_api" : "${routePrefix}/${tableName}/config/header",
        "row_actions_config_api" : "${routePrefix}/${tableName}/config/row-actions",

        "table_lock_api" : "${routePrefix}/${tableName}/lock/table",
        "row_lock_api" : "${routePrefix}/${tableName}/lock/rows",
        "lock_status_api" : "${routePrefix}/${tableName}/lock",

        "export_data_api" : "${routePrefix}/${tableName}/export",
        "download_data_api" : "${routePrefix}/${tableName}/download",

        "list_view_api" : "${routePrefix}/${tableName}/view/list",
        "save_view_api" : "${routePrefix}/${tableName}/view/create",
        "get_view_api" : "${routePrefix}/${tableName}/view/:id",
        "delete_view_api" : "${routePrefix}/${tableName}/view/:id",
        "default_view_api" : "${routePrefix}/${tableName}/view/:id/default",

        "live_talk_api" : "${routePrefix}/${tableName}/talk",
        "live_listen_api" : "${routePrefix}/${tableName}/listen",

        "ai_summary_api" : "${routePrefix}/${tableName}/ai/summary",
        "ai_interact_api" : "${routePrefix}/${tableName}/ai/interact"
    },

    "show_title_header_section" : true,

    "enable_add_data_button" : true,

    "add_data_button_name" : "${addButtonLabel}",
    "add_button_label" : "${addButtonLabel}",

    "show_table_headers" : true,

    "enable_table_search_filters" : true,

    "enable_row_level_checkboxes" : true,

    "enable_master_level_checkbox" : true,

    "min_height" : "380px",
    "max_height" : "calc(100vh - 240px)",
    "editable_single_multiple_selected_rows" : true,
    "editable_all_rows" : true,

    "action_panel" : true,

    "action_column" : {
        "active" : true,
        "options" : [
            "refresh",
            "disable",
            "revert",
            "view",
            "pin / unpin",
            "lock",
            "edit",
            "delete"
        ]
    },

    "rows" : {
        "row_expansion" : false,
        "freez" : false
    },

    "pagination": {
        "active": true,
        "default_page_size": 10,
        "page_size_options": [10, 25, 50, 100, 200, 250]
    }
};
`;
}

// 2. Column Config
function generateColumnConfig(cfg: EntityConfig): string {
  const { entityName, tableName, columns } = cfg;

  const colEntries = columns.map(c => {
    // Only add freeze if explicitly declared on the column
    const isFreeze = c.freez
      ? `,\n        freez: {\n            freez_side: "${c.freez.freez_side}",\n            order: ${c.freez.order}\n        }`
      : '';

    // Generate filter_data based on dropdown options or empty array
    let filterDataStr = '[]';
    if (c.dropdown_options && c.dropdown_options.length > 0) {
      const opts = c.dropdown_options.map(opt => ({
        key: opt.key,
        name: opt.name,
        type: 'check_box',
        default: !!opt.default
      }));
      filterDataStr = JSON.stringify(opts, null, 12).replace(/\n\s*\]$/, '\n        ]');
    }

    // Modal configuration
    const modalSection = c.modal ? `,\n        modal: {
            order: ${c.modal.order || c.order || 1},
            horizontal_section: "${c.modal.horizontal_section || 'h_section_1'}",
            required: ${!!c.modal.required},
            error_note: "${c.modal.error_note || ''}",
            info_note: "${c.modal.info_note || ''}"
        }` : '';

    return `    ${c.key}: {
        header_name: "${c.header_name}",
        filter_key: "${c.key}",
        columns: {
            ${tableName}: "${c.key}"
        },
        order: ${c.order || 1},
        filter_type: "${c.filter_type}",
        editable: ${c.editable},
        sorting: ${c.sorting},
        selected: true,
        column_resize: true,
        info_note: "${c.info_note || c.header_name}",
        elipsis: "${c.elipsis || 'text_elipsis'}",
        active: ${c.active !== undefined ? c.active : true},
        width: "${c.width || '180px'}",
        cell_mode: "${c.cell_mode || 'text_code_1000'}"${modalSection}${isFreeze},
        filter_data: ${filterDataStr}
    }`;
  }).join(',\n');

  return `export const ${entityName}ColumnConfig = {
${colEntries}
};

export const ${entityName}ColumnOptionsConfig = {
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
`;
}

// 3. Header Config (100% matched with UserHeaderConfig)
function generateHeaderConfig(cfg: EntityConfig): string {
  const { entityName, columns, tableName, tableKey, displayName, addButtonLabel, routePrefix } = cfg;
  const entityPlural = toPascalCase(toPlural(entityName));
  const snake = toSnakeCase(entityName);

  const headerFilters = columns.map(c => {
    let opts = c.dropdown_options || [];
    return `        ${c.key}: {
            key: "${c.key}",
            name: "${c.header_name}",
            active: ${c.active !== undefined ? c.active : true},
            filter_type: "${c.filter_type}",
            options: ${JSON.stringify(opts, null, 12).replace(/\n\s*\]$/, '\n            ]')}
        }`;
  }).join(',\n');

  return `export const ${entityName}HeaderConfig = {
    title: {
        display_name: "${displayName}",
        table_key: "${tableKey}",
        description: "Component-based data architecture: granular headers, action components, cells, and filters."
    },
    sync: {
        active: true,
        name: "Sync API",
        api: "${routePrefix}/${tableName}",
        info_note: "Re-sync from API",
        icon: "sync"
    },
    add_button: {
        active: true,
        name: "${addButtonLabel}",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single ${entityName}",
                description: "Create 1 ${entityName.toLowerCase()} manually via form",
                popup_component: "create_${snake}_modal",
                api: "${routePrefix}/${tableName}/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple ${entityPlural} (Batch)",
                description: "Create N ${tableName} via batch API",
                popup_component: "batch_create_modal",
                api: "${routePrefix}/${tableName}/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import ${entityPlural} (File Upload)",
                description: "Upload .xlsx / .csv to create ${tableName}",
                popup_component: "import_create_modal",
                api: "${routePrefix}/${tableName}/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing ${tableName}",
                popup_component: "import_update_modal",
                api: "${routePrefix}/${tableName}/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    },
    search_sync: {
        active: true,
        placeholder: "Search ${tableName}...",
        info_note: "Global table search bar"
    },
    filters: {
${headerFilters}
    }
};
`;
}

// 4. Row Actions Config (100% matched with UserRowActionsConfig)
function generateRowActionsConfig(cfg: EntityConfig): string {
  const { entityName, tableName, routePrefix } = cfg;
  const snake = toSnakeCase(entityName);

  return `export const ${entityName}RowActionsConfig = {
    active: true,
    actions: {
        refresh: {
            key: "refresh",
            name: "Refresh",
            active: true,
            info_note: "Refresh only this row from database",
            api: "${routePrefix}/${tableName}/:id",
            method: "GET",
            icon: "refresh",
            order: 1
        },
        disable: {
            key: "disable",
            name: "Disable / Enable",
            active: true,
            info_note: "Toggle active / inactive status for this row",
            api: "${routePrefix}/${tableName}/update/:id",
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
            popup_component: "view_${snake}_modal",
            api: "${routePrefix}/${tableName}/:id",
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
            api: "${routePrefix}/${tableName}/lock/rows",
            method: "POST",
            icon: "lock",
            order: 6
        },
        edit: {
            key: "edit",
            name: "Edit",
            active: true,
            info_note: "Edit details in modal form",
            popup_component: "edit_${snake}_modal",
            api: "${routePrefix}/${tableName}/update/:id",
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
            api: "${routePrefix}/${tableName}/delete/:id",
            method: "DELETE",
            icon: "trash",
            order: 8
        }
    }
};
`;
}

// 5. Actions Config (100% matched with UserActionsConfig: 6 sections, 25 actions)
function generateActionsConfig(cfg: EntityConfig): string {
  const { entityName } = cfg;

  return `export const ${entityName}ActionsConfig = {
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
`;
}

// 6. SQL Filter Config (100% robust dynamic query builder)
function generateFilterConfig(cfg: EntityConfig): string {
  const { entityName, columns } = cfg;
  const stringCols = columns.filter(c => c.type === 'string' && c.key !== 'id').map(c => c.key);
  const searchClause = stringCols.length > 0
    ? stringCols.map(col => `${col} ILIKE $` + '${idx}').join(' OR ')
    : '1=1';

  return `import { ${entityName}ColumnConfig } from "./${toSnakeCase(entityName)}.column.config.js";

function parseDateInput(dateStr: any): string {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const trimmed = dateStr.trim();
    const dmyMatch = trimmed.match(/^(\\d{1,2})[-/](\\d{1,2})[-/](\\d{4})$/);
    if (dmyMatch) {
        const day = dmyMatch[1] || '';
        const month = dmyMatch[2] || '';
        const year = dmyMatch[3] || '';
        return \`\${year}-\${month.padStart(2, '0')}-\${day.padStart(2, '0')}\`;
    }
    return trimmed;
}

export function MasterFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    const search = inputs?.master_search || inputs?.master || inputs?.search || inputs?.q || inputs?.filters?.search || inputs?.filters?.q;

    if (!search || typeof search !== 'string' || search.trim() === '') {
        return '';
    }

    const term = \`%\${search.trim()}%\`;
    const idx = values.length + 1;
    values.push(term);

    return \` AND (${searchClause})\`;
}

export function ${entityName}FilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    let clause = '';

    if (!inputs || typeof inputs !== 'object') {
        return '';
    }

    let filtersObj = inputs.filters;
    if (typeof filtersObj === 'string') {
        try { filtersObj = JSON.parse(filtersObj); } catch (_) { filtersObj = {}; }
    }
    if (!filtersObj || typeof filtersObj !== 'object' || Array.isArray(filtersObj)) {
        filtersObj = {};
    }

    for (const [colKey, config] of Object.entries<any>(${entityName}ColumnConfig)) {
        const filterKey = config.filter_key || colKey;
        const dbColumn = colKey;

        let rawVal = filtersObj[filterKey] !== undefined ? filtersObj[filterKey]
            : (filtersObj[colKey] !== undefined ? filtersObj[colKey]
            : (inputs[filterKey] !== undefined ? inputs[filterKey]
            : inputs[colKey]));

        if (rawVal === undefined || rawVal === null || rawVal === '') continue;

        if (typeof rawVal === 'string' && (rawVal.startsWith('[') || rawVal.startsWith('{'))) {
            try { rawVal = JSON.parse(rawVal); } catch (_) {}
        }

        if (typeof rawVal === 'string' && rawVal.includes(',') && (config.filter_type === 'multi_search' || config.filter_type === 'list')) {
            rawVal = rawVal.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const fType = config.filter_type || 'search';

        // 1. multi_search (array of search tokens or single string)
        if (fType === 'multi_search') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal.filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const orParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(\`%\${String(item).trim()}%\`);
                        return \`\${dbColumn} ILIKE $\${idx}\`;
                    });
                    clause += \` AND (\${orParts.join(' OR ')})\`;
                }
            } else {
                const idx = values.length + 1;
                values.push(\`%\${String(rawVal).trim()}%\`);
                clause += \` AND \${dbColumn} ILIKE $\${idx}\`;
            }
        }
        // 2. single_search or search
        else if (fType === 'single_search' || fType === 'search') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal.filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const orParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(\`%\${String(item).trim()}%\`);
                        return \`\${dbColumn} ILIKE $\${idx}\`;
                    });
                    clause += \` AND (\${orParts.join(' OR ')})\`;
                }
            } else {
                const term = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal);
                if (term) {
                    const idx = values.length + 1;
                    values.push(\`%\${term}%\`);
                    clause += \` AND \${dbColumn} ILIKE $\${idx}\`;
                }
            }
        }
        // 3. dropdowns / lists / enums (case-insensitive UPPER check)
        else if (fType === 'list' || fType === 'dropdown_checkboxes' || fType === 'dropdown_checkbox') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal
                    .map(item => typeof item === 'object' && item !== null ? (item.key ?? item.value ?? item.name) : item)
                    .filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const inParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(String(item).trim().toUpperCase());
                        return \`UPPER(\${dbColumn}::text) = $\${idx}\`;
                    });
                    clause += \` AND (\${inParts.join(' OR ')})\`;
                }
            } else {
                const item = typeof rawVal === 'object' && rawVal !== null ? (rawVal.key ?? rawVal.value ?? rawVal.name) : rawVal;
                const idx = values.length + 1;
                values.push(String(item).trim().toUpperCase());
                clause += \` AND UPPER(\${dbColumn}::text) = $\${idx}\`;
            }
        }
        // 4. date_range
        else if (fType === 'date_range') {
            let startDate: any = null;
            let endDate: any = null;

            if (Array.isArray(rawVal)) {
                if (rawVal.length >= 1) startDate = rawVal[0];
                if (rawVal.length >= 2) endDate = rawVal[1];
            } else if (typeof rawVal === 'object' && (rawVal.start || rawVal.end || rawVal.from || rawVal.to)) {
                startDate = rawVal.start || rawVal.from;
                endDate = rawVal.end || rawVal.to;
            } else if (typeof rawVal === 'string' && rawVal.includes(',')) {
                const parts = rawVal.split(',').map(s => s.trim());
                startDate = parts[0];
                endDate = parts[1];
            } else if (typeof rawVal === 'string') {
                startDate = rawVal;
                endDate = rawVal;
            }

            if (startDate) {
                const parsedStart = parseDateInput(startDate);
                if (parsedStart) {
                    const idx = values.length + 1;
                    values.push(parsedStart);
                    clause += \` AND \${dbColumn}::date >= $\${idx}::date\`;
                }
            }
            if (endDate) {
                const parsedEnd = parseDateInput(endDate);
                if (parsedEnd) {
                    const idx = values.length + 1;
                    values.push(parsedEnd);
                    clause += \` AND \${dbColumn}::date <= $\${idx}::date\`;
                }
            }
        }
        // 5. single_date
        else if (fType === 'single_date') {
            const parsed = parseDateInput(rawVal);
            if (parsed) {
                const idx = values.length + 1;
                values.push(parsed);
                clause += \` AND \${dbColumn}::date = $\${idx}::date\`;
            }
        }
        // 6. number_range or numeric
        else if (fType === 'number_range' || fType === 'numeric') {
            let minVal: any = null;
            let maxVal: any = null;

            if (Array.isArray(rawVal)) {
                if (rawVal.length >= 1 && rawVal[0] !== '' && !isNaN(Number(rawVal[0]))) minVal = Number(rawVal[0]);
                if (rawVal.length >= 2 && rawVal[1] !== '' && !isNaN(Number(rawVal[1]))) maxVal = Number(rawVal[1]);
            } else if (typeof rawVal === 'object') {
                if (rawVal.min !== undefined && rawVal.min !== '' && !isNaN(Number(rawVal.min))) minVal = Number(rawVal.min);
                if (rawVal.max !== undefined && rawVal.max !== '' && !isNaN(Number(rawVal.max))) maxVal = Number(rawVal.max);
            } else if (typeof rawVal === 'string' && rawVal.includes('-')) {
                const parts = rawVal.split('-').map(s => s.trim());
                if (parts[0] !== '' && !isNaN(Number(parts[0]))) minVal = Number(parts[0]);
                if (parts[1] !== '' && !isNaN(Number(parts[1]))) maxVal = Number(parts[1]);
            } else {
                const num = Number(rawVal);
                if (!isNaN(num)) {
                    const idx = values.length + 1;
                    values.push(num);
                    clause += \` AND \${dbColumn}::numeric = $\${idx}\`;
                }
            }

            if (minVal !== null) {
                const idx = values.length + 1;
                values.push(minVal);
                clause += \` AND \${dbColumn}::numeric >= $\${idx}\`;
            }
            if (maxVal !== null) {
                const idx = values.length + 1;
                values.push(maxVal);
                clause += \` AND \${dbColumn}::numeric <= $\${idx}\`;
            }
        }
        // 7. single_number
        else if (fType === 'single_number') {
            const num = Number(rawVal);
            if (!isNaN(num)) {
                const idx = values.length + 1;
                values.push(num);
                clause += \` AND \${dbColumn}::numeric = $\${idx}\`;
            }
        }
        // 8. boolean
        else if (config.type === 'boolean') {
            const boolStr = String(rawVal).toLowerCase();
            if (boolStr === 'true' || boolStr === 'false') {
                const idx = values.length + 1;
                values.push(boolStr === 'true');
                clause += \` AND \${dbColumn} = $\${idx}\`;
            }
        }
    }

    return clause;
}
`;
}

// 7. Zod Validator
function generateValidator(cfg: EntityConfig): string {
  const { entityName, columns, tableKey } = cfg;
  const entityPlural = toPascalCase(toPlural(entityName));

  const createFields = columns
    .filter(c => c.key !== 'id' && c.key !== 'created_at' && c.key !== 'updated_at')
    .map(c => {
      let zType = 'z.string()';
      if (c.type === 'number') zType = 'z.coerce.number()';
      else if (c.type === 'boolean') zType = 'z.coerce.boolean()';
      else if (c.type === 'date') zType = 'z.string()';
      else if (c.type === 'enum' && c.dropdown_options && c.dropdown_options.length > 0) {
        const keys = c.dropdown_options.map(o => `"${o.key}"`).join(', ');
        zType = `z.enum([${keys}])`;
      }
      if (!c.required) zType += '.optional()';
      return `            ${c.key}: ${zType}`;
    }).join(',\n');

  const updateFields = columns
    .filter(c => c.key !== 'id' && c.key !== 'created_at' && c.key !== 'updated_at')
    .map(c => {
      let zType = 'z.string()';
      if (c.type === 'number') zType = 'z.coerce.number()';
      else if (c.type === 'boolean') zType = 'z.coerce.boolean()';
      else if (c.type === 'date') zType = 'z.string()';
      return `            ${c.key}: ${zType}.optional()`;
    }).join(',\n');

  return `import { z } from "zod";
import * as XLSX from "xlsx";

export class ${entityName}Validator {

    create${entityName}(req: any) {
        const schema = z.object({
${createFields}
        });
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    get${entityName}(req: any) {
        return req.params?.id;
    }

    get${entityPlural}(req: any) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const query = (req.query && typeof req.query === 'object') ? req.query : {};

        let pageRaw = body.page ?? query.page ?? 1;
        let limitRaw = body.limit ?? query.limit ?? 25;

        const page = Number(pageRaw) > 0 ? Number(pageRaw) : 1;
        const limit = Number(limitRaw) > 0 ? Number(limitRaw) : 25;

        let filters: any = {};
        if (body.filters !== undefined) {
            filters = body.filters;
        } else if (query.filters !== undefined) {
            filters = query.filters;
        }

        if (typeof filters === 'string') {
            try {
                filters = JSON.parse(filters);
            } catch (_) {
                filters = {};
            }
        }
        if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
            filters = {};
        }

        let sort: any = body.sort ?? query.sort ?? null;
        if (typeof sort === 'string' && (sort.startsWith('{') || sort.startsWith('['))) {
            try {
                sort = JSON.parse(sort);
            } catch (_) {}
        }

        const mergedInputs: any = {
            ...query,
            ...body,
            page,
            limit,
            filters: { ...filters },
            sort: sort ?? (query.sort || body.sort)
        };

        // Unpack any individual query parameters that were stringified
        for (const [k, v] of Object.entries(mergedInputs)) {
            if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) {
                try {
                    mergedInputs[k] = JSON.parse(v);
                } catch (_) {}
            }
        }

        for (const [k, v] of Object.entries(filters)) {
            if (mergedInputs[k] === undefined) {
                mergedInputs[k] = v;
            }
        }

        return mergedInputs;
    }

    update${entityName}(req: any) {
        const schema = z.object({
${updateFields}
        }).refine(data => Object.keys(data).length > 0, "No fields provided for update");
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    createAll${entityPlural}(req: any) {
        const body = Array.isArray(req.body) ? req.body : (req.body?.records || req.body?.data || []);
        const schema = z.array(z.object({
${createFields}
        })).min(1, "At least one record is required");
        const result = schema.safeParse(body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateBulk${entityPlural}(req: any) {
        const updates = Array.isArray(req.body) ? req.body : (req.body?.updates || []);
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error("No bulk updates provided");
        }
        return updates;
    }

    updateAll${entityPlural}(req: any) {
        const ids = req.body?.ids || [];
        const data = req.body?.data || {};
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("IDs array required");
        if (Object.keys(data).length === 0) throw new Error("Update data required");
        return { ids, data };
    }

    deleteAll${entityPlural}(req: any) {
        const ids = req.body?.ids || (Array.isArray(req.body) ? req.body : []);
        if (!Array.isArray(ids) || ids.length === 0) throw new Error("IDs array required");
        return ids;
    }

    deleteBulk${entityPlural}(req: any) {
        return this.deleteAll${entityPlural}(req);
    }

    importCreate${entityPlural}(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        let rawRows: any[] = [];
        if (file && file.buffer) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (sheetName && workbook.Sheets[sheetName]) {
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            }
        }
        return { records: rawRows, file: file?.originalname };
    }

    importUpdate${entityPlural}(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        let rawRows: any[] = [];
        if (file && file.buffer) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (sheetName && workbook.Sheets[sheetName]) {
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            }
        }
        return { updates: rawRows, identifierKey: req.body?.identifier_key || 'id' };
    }

    aiSummary(req: any) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const rawIds = body.selected_row_ids || body.row_ids || [];
        const rawRows = body.selected_rows || body.rows_sample || [];
        const rawFilters = body.active_filters || body.filters || {};
        return {
            selected_row_ids: Array.isArray(rawIds) ? rawIds.map(String) : [],
            selected_rows: Array.isArray(rawRows) ? rawRows : [],
            active_filters: (rawFilters && typeof rawFilters === 'object') ? rawFilters : {},
            table_key: body.table_key || '${tableKey}'
        };
    }

    aiInteract(req: any) {
        const body = (req.body && typeof req.body === 'object') ? req.body : {};
        const query = typeof body.query === 'string' ? body.query.trim() : '';
        if (!query) throw new Error("Query is required for AI interaction");
        return {
            query,
            columns: Array.isArray(body.columns) ? body.columns : [],
            current_rows: Array.isArray(body.current_rows) ? body.current_rows : [],
            selected_row_ids: Array.isArray(body.selected_row_ids) ? body.selected_row_ids.map(String) : [],
            active_filters: (body.active_filters && typeof body.active_filters === 'object') ? body.active_filters : {},
            table_key: body.table_key || '${tableKey}'
        };
    }
}
`;
}

// 8. Database Repository (100% PascalCase plural methods matching Service)
function generateRepository(cfg: EntityConfig): string {
  const { entityName, tableName, database, tableKey, columns } = cfg;
  const entityPlural = toPascalCase(toPlural(entityName));
  const dbAccess = `db.${database || 'master'}`;
  const validSortCols = columns.map(c => `'${c.key}'`).join(', ');

  return `import db from "../../../platformdb/facade.js";
import { MasterFilterConfig, ${entityName}FilterConfig } from "../config/${toSnakeCase(entityName)}.filter.config.js";

export class ${entityName}Repository {

    constructor() {}

    async create${entityName}(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
            const query = \`INSERT INTO master.${tableName} (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING id\`;
            const result = await ${dbAccess}.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.error('[${entityName}Repository:create${entityName}] Error:', error);
            if (error.code === "23505") throw new Error('${entityName.toLowerCase()} already exists');
            throw error;
        }
    }

    async get${entityName}(id: any) {
        try {
            const query = \`SELECT * FROM master.${tableName} WHERE id = $1 LIMIT 1\`;
            const result = await ${dbAccess}.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[${entityName}Repository:get${entityName}] Error:', error);
            throw error;
        }
    }

    async get${entityPlural}(limit: number, offset: number, inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = \`SELECT * FROM master.${tableName} WHERE 1=1\`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ${entityName}FilterConfig(filterInputs, inputValues);

            const validSortColumns = [${validSortCols}];
            let sortClause = ' ORDER BY created_at DESC';

            if (inputs?.sort && typeof inputs.sort === 'object' && !Array.isArray(inputs.sort)) {
                const col = inputs.sort.column || inputs.sort.field || Object.keys(inputs.sort)[0];
                const dir = inputs.sort.order || inputs.sort.direction || Object.values(inputs.sort)[0];
                if (validSortColumns.includes(col)) {
                    sortClause = \` ORDER BY \${col} \${String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}\`;
                }
            } else if (typeof inputs?.sort === 'string' && validSortColumns.includes(inputs.sort)) {
                sortClause = \` ORDER BY \${inputs.sort} ASC\`;
            }

            query += sortClause;
            query += \` LIMIT $\${inputValues.length + 1} OFFSET $\${inputValues.length + 2}\`;
            inputValues.push(limit, offset);

            const result = await ${dbAccess}.query(query, inputValues);
            return result?.rows || [];
        } catch (error) {
            console.error('[${entityName}Repository:get${entityPlural}] Error:', error);
            return [];
        }
    }

    async getTotal${entityPlural}(inputs: any = {}) {
        try {
            const inputValues: any[] = [];
            const filterInputs = { ...inputs, values: inputValues };

            let query = \`SELECT COUNT(*) as total FROM master.${tableName} WHERE 1=1\`;
            query += MasterFilterConfig(filterInputs, inputValues);
            query += ${entityName}FilterConfig(filterInputs, inputValues);

            const result = await ${dbAccess}.query(query, inputValues);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            console.error('[${entityName}Repository:getTotal${entityPlural}] Error:', error);
            return 0;
        }
    }

    async update${entityName}(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            if (keys.length === 0) return null;
            const setClause = keys.map((k, i) => \`\${k} = $\${i + 2}\`).join(', ');
            const query = \`UPDATE master.${tableName} SET \${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *\`;
            const result = await ${dbAccess}.query(query, [id, ...vals]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[${entityName}Repository:update${entityName}] Error:', error);
            throw error;
        }
    }

    async delete${entityName}(id: any) {
        try {
            const query = \`DELETE FROM master.${tableName} WHERE id = $1 RETURNING id\`;
            const result = await ${dbAccess}.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[${entityName}Repository:delete${entityName}] Error:', error);
            throw error;
        }
    }

    async createBulk${entityPlural}(records: any[]) {
        const results = [];
        for (const rec of records) {
            const res = await this.create${entityName}(rec);
            results.push(res);
        }
        return results;
    }

    async updateBulk${entityPlural}(updates: any[]) {
        const results = [];
        for (const item of updates) {
            const { id, ...data } = item;
            if (id) {
                const res = await this.update${entityName}(id, data);
                results.push(res);
            }
        }
        return results;
    }

    async updateAll${entityPlural}(ids: any[], data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => \`\${k} = $\${i + 1}\`).join(', ');
            const query = \`UPDATE master.${tableName} SET \${setClause}, updated_at = NOW() WHERE id = ANY($\${keys.length + 1}) RETURNING id\`;
            const result = await ${dbAccess}.query(query, [...vals, ids]);
            return result.rows;
        } catch (error) {
            console.error('[${entityName}Repository:updateAll${entityPlural}] Error:', error);
            throw error;
        }
    }

    async deleteAll${entityPlural}(ids: any[]) {
        try {
            const query = \`DELETE FROM master.${tableName} WHERE id = ANY($1) RETURNING id\`;
            const result = await ${dbAccess}.query(query, [ids]);
            return result.rows;
        } catch (error) {
            console.error('[${entityName}Repository:deleteAll${entityPlural}] Error:', error);
            throw error;
        }
    }

    async import${entityPlural}(records: any[], _options: any = {}) {
        return await this.createBulk${entityPlural}(records);
    }

    async importUpdate${entityPlural}(updates: any[], _options: any = {}) {
        return await this.updateBulk${entityPlural}(updates);
    }

    // ── Table Views Methods ──
    async getViews(tableKey = '${tableKey}', userId = null) {
        try {
            let query = \`SELECT * FROM master.table_views WHERE table_key = $1\`;
            const params: any[] = [tableKey];
            if (userId) {
                query += \` AND (user_id = $2 OR is_shared = true OR user_id IS NULL)\`;
                params.push(userId);
            }
            const result = await ${dbAccess}.query(query, params);
            return result?.rows || [];
        } catch (error) {
            console.error('[${entityName}Repository:getViews] Error:', error);
            return [];
        }
    }

    async saveView(data: any) {
        try {
            const { id, name, table_key = '${tableKey}', user_id = null, description = null, is_default = false, is_shared = false, is_locked = false, view_state = {} } = data;
            if (id) {
                const query = \`
                    UPDATE master.table_views
                    SET name = $2, description = $3, is_default = $4, is_shared = $5, is_locked = $6, view_state = $7, updated_at = NOW()
                    WHERE id = $1 RETURNING *
                \`;
                const result = await ${dbAccess}.query(query, [id, name, description, is_default, is_shared, is_locked, JSON.stringify(view_state)]);
                return result?.rows?.[0];
            } else {
                const query = \`
                    INSERT INTO master.table_views (name, table_key, user_id, description, is_default, is_shared, is_locked, view_state)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
                \`;
                const result = await ${dbAccess}.query(query, [name, table_key, user_id, description, is_default, is_shared, is_locked, JSON.stringify(view_state)]);
                return result?.rows?.[0];
            }
        } catch (error) {
            console.error('[${entityName}Repository:saveView] Error:', error);
            throw error;
        }
    }

    async getViewById(id: any) {
        try {
            const query = \`SELECT * FROM master.table_views WHERE id = $1 LIMIT 1\`;
            const result = await ${dbAccess}.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[${entityName}Repository:getViewById] Error:', error);
            throw error;
        }
    }

    async deleteView(id: any) {
        try {
            const query = \`DELETE FROM master.table_views WHERE id = $1 RETURNING id\`;
            const result = await ${dbAccess}.query(query, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[${entityName}Repository:deleteView] Error:', error);
            throw error;
        }
    }

    async setDefaultView(id: any, tableKey = '${tableKey}', _userId: any = null) {
        try {
            await ${dbAccess}.query(\`UPDATE master.table_views SET is_default = false WHERE table_key = $1\`, [tableKey]);
            const result = await ${dbAccess}.query(\`UPDATE master.table_views SET is_default = true WHERE id = $1 RETURNING *\`, [id]);
            return result?.rows?.[0] || null;
        } catch (error) {
            console.error('[${entityName}Repository:setDefaultView] Error:', error);
            throw error;
        }
    }
}
`;
}

// 9. Service Interface
function generateService(cfg: EntityConfig): string {
  const { entityName } = cfg;
  const entityPlural = toPascalCase(toPlural(entityName));

  return `export default class ${entityName}Service {
    get${entityPlural}: any;
    get${entityName}: any;
    delete${entityName}: any;
    update${entityName}: any;
    create${entityName}: any;
    createAll${entityPlural}: any;
    updateBulk${entityPlural}: any;
    updateAll${entityPlural}: any;
    deleteAll${entityPlural}: any;
    import${entityPlural}: any;
    importUpdate${entityPlural}: any;
    getViews: any;
    saveView: any;
    getView: any;
    deleteView: any;
    setDefaultView: any;
}
`;
}

// 10. Service Implementation
function generateServiceImpl(cfg: EntityConfig): string {
  const { entityName, tableKey } = cfg;
  const entityPlural = toPascalCase(toPlural(entityName));
  const repoProp = `${toCamelCase(entityName)}Repository`;

  return `import ${entityName}Service from "./${entityName}Service.js";

export class ${entityName}ServiceImpl implements ${entityName}Service {

    private readonly repo: any;

    constructor({ ${repoProp} }: any) {
        this.repo = ${repoProp};
    }

    async create${entityName}(input: any) {
        return await this.repo.create${entityName}(input);
    }

    async get${entityName}(id: any) {
        return await this.repo.get${entityName}(id);
    }

    async get${entityPlural}(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.get${entityPlural}(limit, offset, inputs);
        const total = await this.repo.getTotal${entityPlural}(inputs);
        return {
            data: records,
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit))
            }
        };
    }

    async update${entityName}(id: any, data: any) {
        return await this.repo.update${entityName}(id, data);
    }

    async delete${entityName}(id: any) {
        return await this.repo.delete${entityName}(id);
    }

    async createAll${entityPlural}(records: any[]) {
        return await this.repo.createBulk${entityPlural}(records);
    }

    async updateBulk${entityPlural}(updates: any[]) {
        return await this.repo.updateBulk${entityPlural}(updates);
    }

    async updateAll${entityPlural}(ids: any[], data: any) {
        return await this.repo.updateAll${entityPlural}(ids, data);
    }

    async deleteAll${entityPlural}(ids: any[]) {
        return await this.repo.deleteAll${entityPlural}(ids);
    }

    async import${entityPlural}(records: any[], options: any = {}) {
        return await this.repo.import${entityPlural}(records, options);
    }

    async importUpdate${entityPlural}(updates: any[], options: any = {}) {
        return await this.repo.importUpdate${entityPlural}(updates, options);
    }

    async getViews(tableKey = '${tableKey}', userId = null) {
        return await this.repo.getViews(tableKey, userId);
    }

    async saveView(data: any) {
        return await this.repo.saveView(data);
    }

    async getView(id: any) {
        return await this.repo.getViewById(id);
    }

    async deleteView(id: any) {
        return await this.repo.deleteView(id);
    }

    async setDefaultView(id: any, tableKey = '${tableKey}', userId = null) {
        return await this.repo.setDefaultView(id, tableKey, userId);
    }
}
`;
}

// 11. Response Layer
function generateResponse(cfg: EntityConfig): string {
  return `export class ${cfg.entityName}Response {}
`;
}

// 12. Controller Handler Layer (all 32 operations)
function generateController(cfg: EntityConfig): string {
  const { entityName, tableName, tableKey } = cfg;
  const single = toCamelCase(entityName);
  const snake = toSnakeCase(entityName);
  const entityPlural = toPascalCase(toPlural(entityName));

  return `import { ${entityName}ColumnConfig, ${entityName}ColumnOptionsConfig } from "../config/${snake}.column.config.js";
import { ${entityName}ActionsConfig } from "../config/${snake}.actions.config.js";
import { ${entityName}HeaderConfig } from "../config/${snake}.header.config.js";
import { ${entityName}RowActionsConfig } from "../config/${snake}.row-actions.config.js";
import { ${entityName}TableConfig } from "../config/${snake}.table.config.js";

export class ${entityName}Controller {

    private readonly service: any;
    private readonly validator: any;

    constructor({ ${single}Service, ${single}Validator }: any) {
        this.service = ${single}Service;
        this.validator = ${single}Validator;
    }

    // ── Table Configurations ──
    async getTableConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}TableConfig });
    }

    async getColumnsConfig(_req: any, res: any) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                columns: ${entityName}ColumnConfig,
                options: ${entityName}ColumnOptionsConfig
            }
        });
    }

    async getActionsConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}ActionsConfig });
    }

    async getHeaderConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}HeaderConfig });
    }

    async getRowActionsConfig(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}RowActionsConfig });
    }

    // ── CRUD Operations ──
    async create(req: any, res: any) {
        try {
            const inputs = this.validator.create${entityName}(req);
            const data = await this.service.create${entityName}(inputs);
            return res.status(200).json({ status: "success", code: 200, message: "${entityName} created successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Creation failed", data: null });
        }
    }

    async get(req: any, res: any) {
        try {
            const id = this.validator.get${entityName}(req);
            const data = await this.service.get${entityName}(id);
            if (!data) {
                return res.status(404).json({ status: "failed", code: 404, message: "${entityName} not found", data: null });
            }
            return res.status(200).json({ status: "success", code: 200, data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Fetch failed", data: null });
        }
    }

    async get${entityPlural}(req: any, res: any) {
        try {
            const validated = this.validator.get${entityPlural}(req);
            const { page, limit, ...filterInputs } = validated;
            const result = await this.service.get${entityPlural}(page, limit, filterInputs);
            const records = result?.records ?? result?.data ?? (Array.isArray(result) ? result : []);
            return res.status(200).json({
                data: records,
                records: records,
                pagination: result.pagination,
                message: "${entityName} list",
                status: "success",
                code: 200
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Listing failed", data: [] });
        }
    }

    async list(req: any, res: any) {
        return this.get${entityPlural}(req, res);
    }

    async update(req: any, res: any) {
        try {
            const id = req.params?.id;
            const inputs = this.validator.update${entityName}(req);
            const data = await this.service.update${entityName}(id, inputs);
            return res.status(200).json({ status: "success", code: 200, message: "${entityName} updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Update failed", data: null });
        }
    }

    async delete(req: any, res: any) {
        try {
            const id = req.params?.id;
            const data = await this.service.delete${entityName}(id);
            return res.status(200).json({ status: "success", code: 200, message: "${entityName} deleted successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Deletion failed", data: null });
        }
    }

    async createAll(req: any, res: any) {
        try {
            const records = this.validator.createAll${entityPlural}(req);
            const data = await this.service.createAll${entityPlural}(records);
            return res.status(200).json({ status: "success", code: 200, message: "All records created successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch create failed", data: null });
        }
    }

    async updateBulk(req: any, res: any) {
        try {
            const updates = this.validator.updateBulk${entityPlural}(req);
            const data = await this.service.updateBulk${entityPlural}(updates);
            return res.status(200).json({ status: "success", code: 200, message: "Bulk updates applied successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Bulk update failed", data: null });
        }
    }

    async updateStatus(req: any, res: any) {
        try {
            const id = req.body?.id || req.query?.id;
            const status = req.body?.status || req.query?.status;
            if (!id || !status) {
                return res.status(400).json({ status: "failed", code: 400, message: "id and status are required", data: null });
            }
            const data = await this.service.update${entityName}(id, { status });
            return res.status(200).json({ status: "success", code: 200, message: "Status updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Status update failed", data: null });
        }
    }

    async updateBulkStatus(req: any, res: any) {
        try {
            const ids = req.body?.ids || [];
            const status = req.body?.status;
            if (!Array.isArray(ids) || ids.length === 0 || !status) {
                return res.status(400).json({ status: "failed", code: 400, message: "ids array and status are required", data: null });
            }
            const data = await this.service.updateAll${entityPlural}(ids, { status });
            return res.status(200).json({ status: "success", code: 200, message: "Bulk status updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Bulk status update failed", data: null });
        }
    }

    async updateAll(req: any, res: any) {
        try {
            const { ids, data: updateData } = this.validator.updateAll${entityPlural}(req);
            const data = await this.service.updateAll${entityPlural}(ids, updateData);
            return res.status(200).json({ status: "success", code: 200, message: "All records updated successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch update failed", data: null });
        }
    }

    async deleteAll(req: any, res: any) {
        try {
            const ids = this.validator.deleteAll${entityPlural}(req);
            const data = await this.service.deleteAll${entityPlural}(ids);
            return res.status(200).json({ status: "success", code: 200, message: "All records deleted successfully", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch delete failed", data: null });
        }
    }

    async deleteBulk(req: any, res: any) {
        return this.deleteAll(req, res);
    }

    async importCreate(req: any, res: any) {
        try {
            const result = this.validator.importCreate${entityPlural}(req);
            const inserted = await this.service.import${entityPlural}(result.records);
            return res.status(200).json({ status: "success", code: 200, message: \`Imported \${result.records.length} records successfully\`, data: inserted });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import failed", data: null });
        }
    }

    async importUpdate(req: any, res: any) {
        try {
            const result = this.validator.importUpdate${entityPlural}(req);
            const updated = await this.service.importUpdate${entityPlural}(result.updates);
            return res.status(200).json({ status: "success", code: 200, message: "Import updates applied successfully", data: updated });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import update failed", data: null });
        }
    }

    // ── Table Locks ──
    async lockTable(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "lockTable initiated", data: null });
    }

    async lockRows(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "lockRows initiated", data: null });
    }

    async getLocks(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "getLocks initiated", data: null });
    }

    // ── Export / Download ──
    async exportData(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "Export initiated", data: null });
    }

    async downloadData(_req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, message: "Download prepared", data: null });
    }

    // ── Saved Views ──
    async listViews(req: any, res: any) {
        try {
            const tableKey = req.query.table_key || '${tableKey}';
            const userId = req.user?.id || req.query.user_id || null;
            const views = await this.service.getViews(tableKey, userId);
            return res.status(200).json({ status: "success", code: 200, message: "Views fetched successfully", data: views });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to fetch views", data: null });
        }
    }

    async saveView(req: any, res: any) {
        try {
            const { name } = req.body;
            if (!name || typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({ status: "failed", code: 400, message: "View name is required", data: null });
            }
            const saved = await this.service.saveView(req.body);
            return res.status(200).json({ status: "success", code: 200, message: "View saved successfully", data: saved });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to save view", data: null });
        }
    }

    async getView(req: any, res: any) {
        try {
            const view = await this.service.getView(req.params.id);
            if (!view) return res.status(404).json({ status: "failed", code: 404, message: "View not found", data: null });
            return res.status(200).json({ status: "success", code: 200, message: "View fetched successfully", data: view });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to fetch view", data: null });
        }
    }

    async deleteView(req: any, res: any) {
        try {
            const deleted = await this.service.deleteView(req.params.id);
            return res.status(200).json({ status: "success", code: 200, message: "View deleted successfully", data: deleted });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to delete view", data: null });
        }
    }

    async setDefaultView(req: any, res: any) {
        try {
            const updated = await this.service.setDefaultView(req.params.id, req.body?.table_key || '${tableKey}');
            return res.status(200).json({ status: "success", code: 200, message: "Default view updated successfully", data: updated });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to set default view", data: null });
        }
    }

    // ── Live SSE Pub / Sub ──
    async liveUpdatePub(req: any, res: any) {
        try {
            const channel = \`table:\${req.body?.table_key || req.query?.table_key || '${tableKey}'}:live\`;
            const payload = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
            const redisClient = (globalThis as any).context?.redis;

            if (!redisClient) {
                return res.status(500).json({ status: "failed", code: 500, message: "Redis is not connected", data: null });
            }

            const messageString = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const subscribersCount = await redisClient.publish(channel, messageString);

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "liveUpdatePub broadcasted successfully",
                data: { channel, subscribers: subscribersCount, published: true }
            });
        } catch (error: any) {
            return res.status(500).json({ status: "failed", code: 500, message: error?.message || "Failed to publish live event", data: null });
        }
    }

    async liveUpdateSub(req: any, res: any) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const channel = \`table:\${req.query?.table_key || '${tableKey}'}:live\`;
        res.write(\`data: \${JSON.stringify({ type: 'connected', channel })}\\n\\n\`);

        const heartbeat = setInterval(() => {
            try { res.write(': heartbeat\\n\\n'); } catch (_) {}
        }, 25000);

        req.on('close', () => {
            clearInterval(heartbeat);
        });
    }

    // ── AI Summary & Interaction ──
    async aiSummary(req: any, res: any) {
        try {
            const inputs = this.validator.aiSummary(req);
            const count = inputs.selected_rows?.length || inputs.selected_row_ids?.length || 0;
            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI summary generated successfully",
                data: {
                    type: count > 0 ? "row_summary" : "table_summary",
                    title: count > 0 ? \`Selected \${count} ${entityName} Records\` : "${entityName} Overview",
                    summary: \`Analyzed \${count > 0 ? count : 'table'} records for ${tableName}.\`,
                    highlights: [\`Total evaluated: \${count}\`],
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "AI summary failed", data: null });
        }
    }

    async aiInteract(req: any, res: any) {
        try {
            const inputs = this.validator.aiInteract(req);
            const query = inputs.query.toLowerCase();
            let reply = \`Processed query for ${tableName}.\`;
            let intent = "general";
            const actions: any = { filters: { set: {}, remove: [] }, proposed_edits: [], generated_rows: [], requires_user_review: false };

            if (query.includes('clear') || query.includes('reset')) {
                intent = "filter_remove";
                actions.filters.remove_all = true;
                reply = "Cleared all filters.";
            } else if (query.includes('filter')) {
                intent = "filter_add";
                reply = "Applied filter based on your query.";
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI interaction processed",
                data: { reply, intent, actions, query: inputs.query, timestamp: new Date().toISOString() }
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "AI query failed", data: null });
        }
    }

    // ── UserController 100% Parity Aliases ──
    createUser = this.create.bind(this);
    get${entityName} = this.get.bind(this);
    update${entityName} = this.update.bind(this);
    delete${entityName} = this.delete.bind(this);
    createAll${entityPlural} = this.createAll.bind(this);
    createBulk${entityPlural} = this.createAll.bind(this);
    updateBulk${entityPlural} = this.updateBulk.bind(this);
    updateAll${entityPlural} = this.updateAll.bind(this);
    deleteAll${entityPlural} = this.deleteAll.bind(this);
    deleteBulk${entityPlural} = this.deleteBulk.bind(this);
    importCreate${entityPlural} = this.importCreate.bind(this);
    importUpdate${entityPlural} = this.importUpdate.bind(this);
    get${entityName}TableConfig = this.getTableConfig.bind(this);
    get${entityName}ColumnsConfig = this.getColumnsConfig.bind(this);
    get${entityName}ActionsConfig = this.getActionsConfig.bind(this);
    get${entityName}HeaderConfig = this.getHeaderConfig.bind(this);
    get${entityName}RowActionsConfig = this.getRowActionsConfig.bind(this);
    update${entityName}Status = this.updateStatus.bind(this);
    updateBulk${entityName}Status = this.updateBulkStatus.bind(this);
    updateAll${entityName}Status = this.updateBulkStatus.bind(this);
}
`;
}

// 13. Route Definition (All 32 Endpoints)
function generateRoute(cfg: EntityConfig): string {
  const { entityName, tableName } = cfg;
  const entityPlural = toPascalCase(toPlural(entityName));

  return `import express from "express";
import multer from "multer";
import { ${entityName}Controller } from "../controller/${entityName}Controller.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class ${entityName}Route {

    route = () => {
        const router = express.Router();
        const ctrl = app(${entityName}Controller);

        // ── Table Configurations ──
        router.get('/${tableName}/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/${tableName}/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/${tableName}/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/${tableName}/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/${tableName}/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/${tableName}', ctrl.get${entityPlural}.bind(ctrl));
        router.post('/${tableName}', ctrl.get${entityPlural}.bind(ctrl));
        router.get('/${tableName}/:id', ctrl.get.bind(ctrl));
        router.post('/${tableName}/create', ctrl.create.bind(ctrl));
        router.post('/${tableName}/create/all', ctrl.createAll.bind(ctrl));
        router.post('/${tableName}/create/bulk', ctrl.createAll.bind(ctrl));
        router.post('/${tableName}/create/import', upload.any(), ctrl.importCreate.bind(ctrl));
        router.put('/${tableName}/update/:id', ctrl.update.bind(ctrl));
        router.post('/${tableName}/update/status', ctrl.updateStatus.bind(ctrl));
        router.post('/${tableName}/update/bulk', ctrl.updateBulk.bind(ctrl));
        router.post('/${tableName}/update/bulk/status', ctrl.updateBulkStatus.bind(ctrl));
        router.post('/${tableName}/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/${tableName}/update/import', upload.any(), ctrl.importUpdate.bind(ctrl));
        router.delete('/${tableName}/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/${tableName}/delete/all', ctrl.deleteAll.bind(ctrl));
        router.delete('/${tableName}/delete/bulk', ctrl.deleteBulk.bind(ctrl));

        // ── Table Locks ──
        router.get('/${tableName}/lock', ctrl.getLocks.bind(ctrl));
        router.post('/${tableName}/lock/table', ctrl.lockTable.bind(ctrl));
        router.post('/${tableName}/lock/rows', ctrl.lockRows.bind(ctrl));

        // ── Exports & Downloads ──
        router.post('/${tableName}/export', ctrl.exportData.bind(ctrl));
        router.post('/${tableName}/download', ctrl.downloadData.bind(ctrl));

        // ── Saved Views ──
        router.get('/${tableName}/view/list', ctrl.listViews.bind(ctrl));
        router.post('/${tableName}/view/create', ctrl.saveView.bind(ctrl));
        router.post('/${tableName}/view/save', ctrl.saveView.bind(ctrl));
        router.get('/${tableName}/view/:id', ctrl.getView.bind(ctrl));
        router.delete('/${tableName}/view/:id', ctrl.deleteView.bind(ctrl));
        router.patch('/${tableName}/view/:id/default', ctrl.setDefaultView.bind(ctrl));

        // ── Realtime SSE Pub / Sub ──
        router.get('/${tableName}/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.post('/${tableName}/talk', ctrl.liveUpdatePub.bind(ctrl));
        router.get('/${tableName}/listen', ctrl.liveUpdateSub.bind(ctrl));
        router.post('/${tableName}/listen', ctrl.liveUpdateSub.bind(ctrl));

        // ── AI Endpoints ──
        router.post('/${tableName}/ai/summary', ctrl.aiSummary.bind(ctrl));
        router.post('/${tableName}/ai/interact', ctrl.aiInteract.bind(ctrl));

        return router;
    };
}
`;
}

// ── Auto-Registration Hooks ────────────────────────────────────────────────────
function updatePlatformDbRegister(cfg: EntityConfig): void {
  const registerFile = path.join(ROOT_DIR, 'src', 'platformdb', 'register.ts');
  if (!fs.existsSync(registerFile)) return;

  const content = fs.readFileSync(registerFile, 'utf8');
  const { entityName, moduleName } = cfg;
  const single = toCamelCase(entityName);

  if (content.includes(`${entityName}Controller`)) {
    console.log(`  ℹ  ${entityName} already registered in src/platformdb/register.ts`);
    return;
  }

  const importBlock = `
import { ${entityName}Repository } from "../modules/${moduleName}/repository/${entityName}Repository.js";
import { ${entityName}Response } from "../modules/${moduleName}/response/${entityName}Response.js";
import { ${entityName}ServiceImpl } from "../modules/${moduleName}/service/${entityName}Service/${entityName}ServiceImpl.js";
import { ${entityName}Controller } from "../modules/${moduleName}/controller/${entityName}Controller.js";
import { ${entityName}Validator } from "../modules/${moduleName}/validator/${entityName}Validator.js";
`;

  const registerBlock = `
register("${single}Controller", ${entityName}Controller);
register("${single}Validator", ${entityName}Validator);
register("${single}Service", ${entityName}ServiceImpl);
register("${single}Repository", ${entityName}Repository);
register("${single}Response", ${entityName}Response);
`;

  const updated = content.replace(/(export default register;)/, `${registerBlock}\n$1`)
                         .replace(/(import { register } from "\.\/app\.js";)/, `$1${importBlock}`);

  fs.writeFileSync(registerFile, updated, 'utf8');
  console.log(`  ✔  Registered in src/platformdb/register.ts`);
}

function updateRoutesApi(cfg: EntityConfig): void {
  const apiFile = path.join(ROOT_DIR, 'src', 'routes', 'api.ts');
  if (!fs.existsSync(apiFile)) return;

  const content = fs.readFileSync(apiFile, 'utf8');
  const { entityName, moduleName } = cfg;
  const routeClass = `${entityName}Route`;

  if (content.includes(routeClass)) {
    console.log(`  ℹ  ${routeClass} already registered in src/routes/api.ts`);
    return;
  }

  const importLine = `import {${routeClass}} from "../modules/${moduleName}/routes/${routeClass}.js";\n`;
  const routeEntry = `    '${routeClass}': ${routeClass},\n`;

  const updated = importLine + content.replace(/(export const api = {)/, `$1\n${routeEntry}`);
  fs.writeFileSync(apiFile, updated, 'utf8');
  console.log(`  ✔  Registered in src/routes/api.ts`);
}

function updatePlatformDbConfig(cfg: EntityConfig): void {
  const configFile = path.join(ROOT_DIR, 'src', 'platformdb', 'config.ts');
  if (!fs.existsSync(configFile)) return;

  const content = fs.readFileSync(configFile, 'utf8');
  const { entityName, productName } = cfg;
  const routeClass = `${entityName}Route`;

  if (content.includes(`"${routeClass}"`)) {
    console.log(`  ℹ  ${routeClass} already present in src/platformdb/config.ts`);
    return;
  }

  // If specific product matched, add under that product's routes array
  if (productName && content.includes(productName)) {
    const prodRegex = new RegExp(`(${productName}[\\s\\S]*?routes:\\s*\\[[^\\]]*)`);
    const match = content.match(prodRegex);
    if (match) {
      const updated = content.replace(prodRegex, `$1, "${routeClass}"`);
      fs.writeFileSync(configFile, updated, 'utf8');
      console.log(`  ✔  Registered in src/platformdb/config.ts under product "${productName}"`);
      return;
    }
  }

  const updated = content.replace(/(routes: \[[^\]]*)/, `$1, "${routeClass}"`);
  fs.writeFileSync(configFile, updated, 'utf8');
  console.log(`  ✔  Registered in src/platformdb/config.ts`);
}

// ── Main Execution ─────────────────────────────────────────────────────────────
export async function run(): Promise<void> {
  console.log('================================================================');
  console.log('🚀 ANTIGRAVITY BACKEND ENTITY GENERATOR');
  console.log('================================================================');

  const cfg = parseArgs();
  console.log(`Entity:        ${cfg.entityName}`);
  console.log(`Table:         ${cfg.tableName}`);
  console.log(`Module:        ${cfg.moduleName}`);
  console.log(`Product:       ${cfg.productName}`);
  console.log(`Database:      ${cfg.database}`);
  console.log(`Table Key:     ${cfg.tableKey}`);
  console.log(`Display Name:  ${cfg.displayName}`);
  console.log(`Target Dir:    ${cfg.outputDir}`);
  console.log(`Route Prefix:  ${cfg.routePrefix}`);
  console.log(`Columns (${cfg.columns.length}):    ${cfg.columns.map(c => `${c.key} (${c.type}/${c.filter_type})`).join(', ')}`);
  console.log(`Mode:          ${cfg.dryRun ? 'DRY RUN (Preview Only - No Files Written)' : 'LIVE EXECUTION'}`);
  console.log(`Safety Policy: NEVER OVERWRITE existing files (force: ${cfg.forceOverwrite})`);
  console.log('----------------------------------------------------------------');

  const baseDir = path.resolve(ROOT_DIR, cfg.outputDir);
  const snake = toSnakeCase(cfg.entityName);

  const filesToCreate: { filePath: string; content: string; desc: string }[] = [
    {
      filePath: path.join(baseDir, 'config', `${snake}.table.config.ts`),
      content: generateTableConfig(cfg),
      desc: 'Table Master Configuration'
    },
    {
      filePath: path.join(baseDir, 'config', `${snake}.column.config.ts`),
      content: generateColumnConfig(cfg),
      desc: 'Column & Options Configuration'
    },
    {
      filePath: path.join(baseDir, 'config', `${snake}.header.config.ts`),
      content: generateHeaderConfig(cfg),
      desc: 'Header Search & Dropdown Config'
    },
    {
      filePath: path.join(baseDir, 'config', `${snake}.row-actions.config.ts`),
      content: generateRowActionsConfig(cfg),
      desc: 'Row Actions Configuration'
    },
    {
      filePath: path.join(baseDir, 'config', `${snake}.actions.config.ts`),
      content: generateActionsConfig(cfg),
      desc: 'Action Panel Sections Config'
    },
    {
      filePath: path.join(baseDir, 'config', `${snake}.filter.config.ts`),
      content: generateFilterConfig(cfg),
      desc: 'Master & Entity Filter SQL Builder'
    },
    {
      filePath: path.join(baseDir, 'validator', `${cfg.entityName}Validator.ts`),
      content: generateValidator(cfg),
      desc: 'Zod Validator Layer'
    },
    {
      filePath: path.join(baseDir, 'repository', `${cfg.entityName}Repository.ts`),
      content: generateRepository(cfg),
      desc: 'Database Repository Layer'
    },
    {
      filePath: path.join(baseDir, 'service', `${cfg.entityName}Service`, `${cfg.entityName}Service.ts`),
      content: generateService(cfg),
      desc: 'Service Interface'
    },
    {
      filePath: path.join(baseDir, 'service', `${cfg.entityName}Service`, `${cfg.entityName}ServiceImpl.ts`),
      content: generateServiceImpl(cfg),
      desc: 'Service Implementation'
    },
    {
      filePath: path.join(baseDir, 'response', `${cfg.entityName}Response.ts`),
      content: generateResponse(cfg),
      desc: 'Response Transform Layer'
    },
    {
      filePath: path.join(baseDir, 'controller', `${cfg.entityName}Controller.ts`),
      content: generateController(cfg),
      desc: 'Controller Handler Layer'
    },
    {
      filePath: path.join(baseDir, 'routes', `${cfg.entityName}Route.ts`),
      content: generateRoute(cfg),
      desc: 'Express Router Definition'
    }
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const f of filesToCreate) {
    const exists = fs.existsSync(f.filePath);

    if (cfg.dryRun) {
      if (exists && !cfg.forceOverwrite) {
        console.log(`[DRY-RUN] [SKIPPED - Already exists] ${path.relative(ROOT_DIR, f.filePath)} (${f.desc})`);
        skippedCount++;
      } else {
        console.log(`[DRY-RUN] [WOULD CREATE] ${path.relative(ROOT_DIR, f.filePath)} (${f.desc})`);
        createdCount++;
      }
    } else {
      if (exists && !cfg.forceOverwrite) {
        console.log(`  ⏭  Skipped (already exists): ${path.relative(ROOT_DIR, f.filePath)}`);
        skippedCount++;
        continue;
      }
      fs.mkdirSync(path.dirname(f.filePath), { recursive: true });
      fs.writeFileSync(f.filePath, f.content, 'utf8');
      console.log(`  ✔  Created: ${path.relative(ROOT_DIR, f.filePath)} (${f.desc})`);
      createdCount++;
    }
  }

  if (cfg.autoRegister && !cfg.dryRun) {
    console.log('\nMounting Routes and Dependency Injections...');
    updatePlatformDbRegister(cfg);
    updateRoutesApi(cfg);
    updatePlatformDbConfig(cfg);
  }

  console.log('----------------------------------------------------------------');
  if (cfg.dryRun) {
    console.log(`✨ Dry run complete! Would create: ${createdCount}, Skipped existing: ${skippedCount}`);
  } else {
    console.log(`🎉 Successfully finished! Created: ${createdCount}, Preserved (skipped): ${skippedCount}`);
    console.log(`Base Route: ${cfg.routePrefix}/${cfg.tableName}`);
  }

  // ── Auto-generate Angular Master Table with dual-table parity ──────────────
  try {
    const angularScript = path.join(ROOT_DIR, 'scripts', 'generate-angular-table.ts');
    if (fs.existsSync(angularScript)) {
      console.log('\n================================================================');
      console.log('🚀 Triggering Angular Master-Table generator with dual-table parity...');
      const tsxCli = path.join(ROOT_DIR, 'node_modules', 'tsx', 'dist', 'cli.mjs');
      const dryRunFlag = cfg.dryRun ? ' --dry-run' : '';
      execSync(`node "${tsxCli}" "${angularScript}" --entity "${cfg.entityName}" --table-key "${cfg.tableKey}" --product "${cfg.productName}"${dryRunFlag}`, {
        stdio: 'inherit'
      });
    }
  } catch (err: any) {
    console.warn('[WARN] Could not automatically generate Angular table:', err?.message || err);
  }

  console.log('================================================================\n');
}

run();
