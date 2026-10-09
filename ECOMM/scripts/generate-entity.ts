#!/usr/bin/env node
/**
 * End-to-End Backend Entity Code Generator
 * Generates decoupled configs, validator, repository, service, controller, and routes for any entity.
 * 
 * Usage:
 *   # Via SQL File with Product and Database:
 *   npm run generate:entity -- --sql src/migrations/identity_management/master/005_customers.sql --product identity_management --database master --dry-run
 * 
 *   # Via CLI arguments:
 *   npm run generate:entity -- --name Employee --table employees --module identity --database master
 * 
 *   # Via JSON schema:
 *   npm run generate:entity -- --schema schema.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
export interface ColumnDefinition {
  key: string;
  header_name: string;
  type: 'string' | 'number' | 'date' | 'enum' | 'boolean';
  filter_type: 'search' | 'multi_search' | 'date_range' | 'single_date' | 'number_range' | 'list';
  editable: boolean;
  required: boolean;
  sorting: boolean;
  order: number;
  width?: string;
  cell_mode?: string;
  info_note?: string;
}

export interface EntityConfig {
  entityName: string;       // e.g. "Customer" or "Invoice"
  tableName: string;        // e.g. "customers" or "invoices"
  moduleName: string;       // e.g. "identity" or "sales"
  outputDir: string;        // e.g. "src/modules/identity"
  routePrefix: string;      // e.g. "/identity/management"
  database: string;         // e.g. "master" or "client"
  productName: string;      // e.g. "identity_management"
  sqlFile?: string;
  columns: ColumnDefinition[];
  autoRegister: boolean;
  dryRun: boolean;
}

// ── SQL File Parser ────────────────────────────────────────────────────────────
function parseSqlFile(sqlPath: string): { tableName: string; columns: ColumnDefinition[] } {
  const resolvedPath = path.isAbsolute(sqlPath) ? sqlPath : path.resolve(ROOT_DIR, sqlPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`SQL file not found at: ${resolvedPath}`);
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');

  // Match CREATE TABLE [IF NOT EXISTS] [schema.]table_name ( ... )
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`]?([a-zA-Z0-9_]+)["`]?\.)?["`]?([a-zA-Z0-9_]+)["`]?\s*\(([\s\S]*?)\)\s*;/i;
  const match = content.match(createTableRegex);
  if (!match) {
    throw new Error(`Could not find a valid CREATE TABLE statement in ${resolvedPath}`);
  }

  const tableName = match[2];
  const body = match[3];

  // Split column statements by commas respecting parentheses (e.g. NUMERIC(18, 2))
  const statements: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;

    if (char === ',' && parenDepth === 0) {
      if (current.trim()) statements.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) statements.push(current.trim());

  const columns: ColumnDefinition[] = [];
  let order = 1;

  for (const rawStmt of statements) {
    // Strip comments and extra spaces
    const clean = rawStmt.replace(/--.*$/gm, '').trim().replace(/\s+/g, ' ');
    if (!clean) continue;

    // Skip table constraints (CONSTRAINT, PRIMARY KEY (...), FOREIGN KEY, etc.)
    if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\b/i.test(clean)) {
      continue;
    }

    const tokens = clean.split(' ');
    if (tokens.length < 2) continue;

    const rawColName = tokens[0].replace(/["`]/g, '');
    const rawColType = tokens[1].toUpperCase();
    const cleanUpper = clean.toUpperCase();

    // Skip primary key 'id' from standard editable table columns
    if (rawColName.toLowerCase() === 'id') {
      continue;
    }

    let colType: 'string' | 'number' | 'date' | 'enum' | 'boolean' = 'string';
    let filterType: 'search' | 'multi_search' | 'date_range' | 'single_date' | 'number_range' | 'list' = 'search';
    let cellMode = 'text_code_1000';
    let width = '180px';

    if (
      rawColType.includes('INT') ||
      rawColType.includes('SERIAL') ||
      rawColType.includes('NUMERIC') ||
      rawColType.includes('DECIMAL') ||
      rawColType.includes('FLOAT') ||
      rawColType.includes('DOUBLE') ||
      rawColType.includes('REAL')
    ) {
      colType = 'number';
      filterType = 'number_range';
      cellMode = 'text_code_3000';
      width = '150px';
    } else if (rawColType.includes('DATE')) {
      colType = 'date';
      filterType = 'date_range';
      cellMode = 'text_code_4000';
      width = '160px';
    } else if (rawColType.includes('TIME')) {
      colType = 'date';
      filterType = 'date_range';
      cellMode = 'text_code_4000';
      width = '180px';
    } else if (rawColType.includes('BOOL')) {
      colType = 'boolean';
      filterType = 'list';
      width = '140px';
    } else if (rawColName.toLowerCase() === 'status' || cleanUpper.includes('CHECK')) {
      colType = 'enum';
      filterType = 'list';
      width = '140px';
    } else if (rawColName.toLowerCase().includes('email')) {
      colType = 'string';
      filterType = 'search';
      cellMode = 'text_code_2000';
      width = '240px';
    } else if (
      rawColName.toLowerCase() === 'first_name' ||
      rawColName.toLowerCase().endsWith('_name')
    ) {
      colType = 'string';
      filterType = rawColName.toLowerCase() === 'first_name' ? 'multi_search' : 'search';
      width = '190px';
    }

    const isRequired = cleanUpper.includes('NOT NULL') && !cleanUpper.includes('DEFAULT');
    const isEditable = !['created_at', 'updated_at', 'deleted_at'].includes(rawColName.toLowerCase());

    columns.push({
      key: rawColName,
      header_name: toTitleCase(rawColName),
      type: colType,
      filter_type: filterType,
      editable: isEditable,
      required: isRequired,
      sorting: true,
      order: order++,
      width,
      cell_mode: cellMode,
      info_note: `${toTitleCase(rawColName)} field`
    });
  }

  return { tableName, columns };
}

// ── Product Config Resolver ────────────────────────────────────────────────────
function resolveProductInfo(productName: string): { routePrefix: string; moduleName: string; outputDir: string } {
  const configFile = path.join(ROOT_DIR, 'src', 'platformdb', 'config.ts');
  let routePrefix = `/${productName.replace(/_/g, '/')}`;
  let moduleName = productName.replace(/_management$/, '');

  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    // e.g. identification: '/identity/management'
    const regex = new RegExp(`${productName}[\\s\\S]*?identification\\s*:\\s*['"]([^'"]+)['"]`);
    const match = content.match(regex);
    if (match && match[1]) {
      routePrefix = match[1];
    }
  }

  // Find module directory under src/modules/
  const modulesDir = path.join(ROOT_DIR, 'src', 'modules');
  if (fs.existsSync(modulesDir)) {
    const entries = fs.readdirSync(modulesDir);
    if (entries.includes(moduleName)) {
      // Direct match (e.g. 'identity')
    } else if (entries.includes(productName)) {
      moduleName = productName;
    } else {
      const match = entries.find(e => productName.startsWith(e) || e.startsWith(moduleName));
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
  let moduleName = 'identity';
  let outputDir = '';
  let routePrefix = '';
  let database = 'master';
  let productName = 'identity_management';
  let sqlFile = '';
  let columns: ColumnDefinition[] = [];
  let autoRegister = true;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--sql') {
      sqlFile = args[++i];
    } else if (a === '--product') {
      productName = args[++i];
    } else if (a === '--database' || a === '--db') {
      database = args[++i];
    } else if (a === '--name' || a === '-n') {
      entityName = args[++i];
    } else if (a === '--table' || a === '-t') {
      tableName = args[++i];
    } else if (a === '--module' || a === '-m') {
      moduleName = args[++i];
    } else if (a === '--path' || a === '-p') {
      outputDir = args[++i];
    } else if (a === '--route-prefix' || a === '-r') {
      routePrefix = args[++i];
    } else if (a === '--no-register') {
      autoRegister = false;
    } else if (a === '--dry-run') {
      dryRun = true;
    } else if (a === '--schema' || a === '-s') {
      const schemaFile = path.resolve(process.cwd(), args[++i]);
      if (fs.existsSync(schemaFile)) {
        const json = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
        if (json.name || json.entityName) entityName = json.name || json.entityName;
        if (json.table || json.tableName) tableName = json.table || json.tableName;
        if (json.module || json.moduleName) moduleName = json.module || json.moduleName;
        if (json.outputDir || json.path) outputDir = json.outputDir || json.path;
        if (json.routePrefix) routePrefix = json.routePrefix;
        if (json.database) database = json.database;
        if (json.product) productName = json.product;
        if (json.columns && Array.isArray(json.columns)) columns = json.columns;
      }
    } else if (a === '--columns' || a === '-c') {
      const rawCols = args[++i].split(',');
      columns = rawCols.map((colStr, idx) => {
        const parts = colStr.trim().split(':');
        const key = parts[0];
        const type = (parts[1] || 'string') as any;
        const flags = parts.slice(2).map(f => f.toLowerCase());
        const required = flags.includes('required');
        const editable = !flags.includes('readonly');
        let filter_type: any = 'search';
        if (type === 'number') filter_type = 'number_range';
        else if (type === 'date') filter_type = 'date_range';
        else if (type === 'enum') filter_type = 'list';
        else if (flags.includes('multi_search')) filter_type = 'multi_search';

        return {
          key,
          header_name: toTitleCase(key),
          type,
          filter_type,
          editable,
          required,
          sorting: true,
          order: idx + 1,
          width: '180px',
          info_note: `${toTitleCase(key)} field`
        };
      });
    }
  }

  // 1. If SQL file provided, parse table and columns directly from SQL
  if (sqlFile) {
    const parsed = parseSqlFile(sqlFile);
    if (!tableName) tableName = parsed.tableName;
    if (columns.length === 0) columns = parsed.columns;
  }

  // 2. Resolve Product details if product name is given
  if (productName) {
    const resolved = resolveProductInfo(productName);
    if (!routePrefix) routePrefix = resolved.routePrefix;
    if (!outputDir) {
      moduleName = resolved.moduleName;
      outputDir = resolved.outputDir;
    }
  }

  // 3. Auto-derive Entity name from table name if not provided
  if (!entityName && tableName) {
    entityName = toPascalCase(toSingular(tableName));
  } else if (!entityName) {
    entityName = 'Employee';
  }

  entityName = toPascalCase(entityName);
  if (!tableName) tableName = toSnakeCase(toPlural(entityName));
  if (!outputDir) outputDir = path.join('src', 'modules', moduleName);
  if (!routePrefix) routePrefix = `/${moduleName}/management`;

  return {
    entityName,
    tableName,
    moduleName,
    outputDir,
    routePrefix,
    database,
    productName,
    sqlFile,
    columns,
    autoRegister,
    dryRun
  };
}

// ── Code Generators ────────────────────────────────────────────────────────────

function generateTableConfig(cfg: EntityConfig): string {
  const { entityName, tableName, routePrefix } = cfg;
  const tableKey = `${tableName}_table_1234`;

  return `export const ${entityName}TableConfig = {
    "table_key" : "${tableKey}",
    "display_name" : "${toTitleCase(tableName)}",
    "table_api" : {
        "table_config_api" : "${routePrefix}/${tableName}/config/table",
        "columns_config_api" : "${routePrefix}/${tableName}/config/columns",
        "actions_config_api" : "${routePrefix}/${tableName}/config/actions",
        "header_config_api" : "${routePrefix}/${tableName}/config/header",
        "row_actions_config_api" : "${routePrefix}/${tableName}/config/row-actions",
        "paginated_data_api" : "${routePrefix}/${tableName}",
        "create_api" : "${routePrefix}/${tableName}/create",
        "create_all_api" : "${routePrefix}/${tableName}/create/all",
        "create_import_api" : "${routePrefix}/${tableName}/create/import",
        "data_api" : "${routePrefix}/${tableName}/:id",
        "update_api" : "${routePrefix}/${tableName}/update/:id",
        "update_bulk_api" : "${routePrefix}/${tableName}/update/bulk",
        "update_all_api" : "${routePrefix}/${tableName}/update/all",
        "update_status_api" : "${routePrefix}/${tableName}/update/status",
        "update_bulk_status_api" : "${routePrefix}/${tableName}/update/bulk/status",
        "update_import_api" : "${routePrefix}/${tableName}/update/import",
        "delete_api" : "${routePrefix}/${tableName}/delete/:id",
        "delete_all_api" : "${routePrefix}/${tableName}/delete/all",
        "delete_bulk_api" : "${routePrefix}/${tableName}/delete/bulk",
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
    "rows": {
        "row_expansion" : false,
        "freez" : true
    },
    "pagination": {
        "active" : true,
        "default_page_size" : 10,
        "page_size_options" : [10, 25, 50, 100]
    }
};
`;
}

function generateColumnConfig(cfg: EntityConfig): string {
  const { entityName, tableName, columns } = cfg;

  const colEntries = columns.map(c => {
    const isFreeze = c.order <= 2 ? `,\n        freez: { freez_side: "left", order: ${c.order} }` : '';
    const filterData = c.filter_type === 'list' 
      ? `[\n            { key: "active", name: "Active" },\n            { key: "inactive", name: "Inactive" },\n            { key: "pending", name: "Pending" }\n        ]`
      : `[]`;

    return `    ${c.key}: {
        header_name: "${c.header_name}",
        filter_key: "${c.key}",
        columns: { ${tableName}: "${c.key}" },
        filter_type: "${c.filter_type}",
        editable: ${c.editable},
        sorting: ${c.sorting},
        order: ${c.order},
        column_resize: true,
        cell_mode: "${c.cell_mode || 'text_code_1000'}",
        info_note: "${c.info_note || c.header_name}",
        elipsis: "text_elipsis",
        active: true,
        width: "${c.width || '180px'}",
        modal: {
            order: ${c.order},
            horizontal_section: "h_section_${Math.ceil(c.order / 2)}",
            required: ${c.required},
            error_note: "${c.header_name} is required",
            info_note: "Enter ${c.header_name.toLowerCase()}"
        }${isFreeze},
        filter_data: ${filterData}
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

function generateHeaderConfig(cfg: EntityConfig): string {
  const { entityName, tableName, routePrefix } = cfg;
  const single = toTitleCase(entityName);
  const plural = toTitleCase(tableName);

  return `export const ${entityName}HeaderConfig = {
    title: {
        display_name: "${plural} Management",
        table_key: "${tableName}_table_1234",
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
        name: "+ Add ${single}",
        dropdown_options: {
            single_add: {
                key: "single_add",
                display_name: "Add Single ${single}",
                description: "Create 1 ${single.toLowerCase()} manually via form",
                popup_component: "create_user_modal",
                api: "${routePrefix}/${tableName}/create",
                icon: "user_plus",
                order: 1
            },
            batch_add: {
                key: "batch_add",
                display_name: "Add Multiple ${plural} (Batch)",
                description: "Create N ${plural.toLowerCase()} via batch API",
                popup_component: "batch_create_modal",
                api: "${routePrefix}/${tableName}/create/all",
                icon: "users_plus",
                order: 2
            },
            import_create: {
                key: "import_create",
                display_name: "Import ${plural} (File Upload)",
                description: "Upload .xlsx / .csv to create records",
                popup_component: "import_create_modal",
                api: "${routePrefix}/${tableName}/create/import",
                icon: "file_upload",
                order: 3
            },
            import_update: {
                key: "import_update",
                display_name: "Import Updates (File Upload)",
                description: "Upload .xlsx / .csv to update existing",
                popup_component: "import_update_modal",
                api: "${routePrefix}/${tableName}/update/import",
                icon: "file_sync",
                order: 4
            }
        }
    }
};
`;
}

function generateRowActionsConfig(cfg: EntityConfig): string {
  const { entityName, tableName, routePrefix } = cfg;

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
            popup_component: "edit_user_modal",
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
`;
}

function generateValidator(cfg: EntityConfig): string {
  const { entityName, columns } = cfg;

  const zodFields = columns.map(c => {
    let zType = 'z.string()';
    if (c.type === 'number') zType = 'z.coerce.number()';
    else if (c.type === 'date') zType = 'z.string()';
    else if (c.type === 'boolean') zType = 'z.boolean()';
    else if (c.type === 'enum') zType = "z.enum(['active', 'inactive', 'pending'])";

    if (!c.required) {
      zType += '.optional()';
    }
    return `            ${c.key}: ${zType}`;
  }).join(',\n');

  const updateZodFields = columns.map(c => {
    let zType = 'z.string()';
    if (c.type === 'number') zType = 'z.coerce.number()';
    else if (c.type === 'date') zType = 'z.string()';
    else if (c.type === 'boolean') zType = 'z.boolean()';
    else if (c.type === 'enum') zType = "z.enum(['active', 'inactive', 'pending'])";
    return `            ${c.key}: ${zType}.optional()`;
  }).join(',\n');

  return `import { z } from "zod";
import * as XLSX from "xlsx";

export class ${entityName}Validator {

    create${entityName}(req: any) {
        const schema = z.object({
${zodFields}
        });
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    update${entityName}(req: any) {
        const schema = z.object({
${updateZodFields}
        }).refine(data => Object.keys(data).length > 0, "No fields provided for update");
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    createAll${toPlural(entityName)}(req: any) {
        const schema = z.array(z.object({
${zodFields}
        })).min(1);
        const result = schema.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateAll${toPlural(entityName)}(req: any) {
        const updateSchema = z.object({
            id: z.coerce.number().int().positive(),
${updateZodFields}
        }).refine(({ id, ...data }) => Object.keys(data).length > 0, "No update fields provided");
        const validator = z.array(updateSchema).min(1);
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    deleteAll${toPlural(entityName)}(req: any) {
        const validator = z.object({
            ids: z.array(z.coerce.number().int())
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data.ids;
    }

    bulkSelection(req: any) {
        const validator = z.object({
            filters: z.record(z.string(), z.unknown()).default({}),
            sorts: z.array(z.object({ key: z.string(), direction: z.enum(['asc', 'desc']) })).default([]),
            excluded: z.array(z.coerce.number().int().positive()).default([])
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateStatus(req: any) {
        const validator = z.object({
            ids: z.array(z.coerce.number().int().positive()).min(1),
            status: z.enum(['active', 'inactive'])
        });
        const result = validator.safeParse(req.body);
        if (!result.success) throw new Error(JSON.stringify(result.error.format()));
        return result.data;
    }

    updateBulkStatus(req: any) {
        const selection = this.bulkSelection(req);
        const status = z.enum(['active', 'inactive']).safeParse(req.body?.status);
        if (!status.success) throw new Error(JSON.stringify(status.error.format()));
        return { ...selection, status: status.data };
    }

    importCreate${toPlural(entityName)}(req: any) {
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

    importUpdate${toPlural(entityName)}(req: any) {
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
        let rawRows: any[] = [];
        if (file && file.buffer) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            if (sheetName && workbook.Sheets[sheetName]) {
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            }
        }
        return { updates: rawRows, identifierKey: req.body?.identifier_key || 'email' };
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
            table_key: body.table_key || '${cfg.tableName}_table_1234'
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
            table_key: body.table_key || '${cfg.tableName}_table_1234'
        };
    }
}
`;
}

function generateRepository(cfg: EntityConfig): string {
  const { entityName, tableName, database } = cfg;
  const dbAccess = `db.${database || 'master'}`;

  return `import db from "../../../platformdb/facade.js";
import { QueryBuilder } from "../../../helpers/QueryBuilder.js";

export class ${entityName}Repository {

    private readonly queryBuilder;

    constructor() {
        this.queryBuilder = new QueryBuilder();
    }

    async create${entityName}(inputs: any) {
        try {
            const keys = Object.keys(inputs);
            const vals = Object.values(inputs);
            const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
            const query = \`INSERT INTO master.${tableName} (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING id\`;
            const result = await ${dbAccess}.query(query, vals);
            return result?.rows;
        } catch (error: any) {
            console.log({ error });
            if (error.code === "23505") throw new Error('${entityName.toLowerCase()} already exists');
            throw error;
        }
    }

    async get${entityName}(id: any) {
        try {
            const query = \`SELECT * FROM master.${tableName} WHERE id=$1 LIMIT 1\`;
            const result = await ${dbAccess}.query(query, [id]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async get${toPlural(entityName)}(limit: number, offset: number, inputs: any = {}) {
        try {
            const query = \`SELECT * FROM master.${tableName} ORDER BY id ASC LIMIT $1 OFFSET $2\`;
            const result = await ${dbAccess}.query(query, [limit, offset]);
            return result?.rows || [];
        } catch (error) {
            return [];
        }
    }

    async getTotal${toPlural(entityName)}(inputs: any = {}) {
        try {
            const query = \`SELECT COUNT(*) as total FROM master.${tableName}\`;
            const result = await ${dbAccess}.query(query);
            return parseInt(result?.rows?.[0]?.total || '0', 10);
        } catch (error) {
            return 0;
        }
    }

    async update${entityName}(id: any, data: any) {
        try {
            const keys = Object.keys(data);
            const vals = Object.values(data);
            const setClause = keys.map((k, i) => \`\${k}=$\${i + 2}\`).join(', ');
            const query = \`UPDATE master.${tableName} SET \${setClause} WHERE id=$1 RETURNING *\`;
            const result = await ${dbAccess}.query(query, [id, ...vals]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async delete${entityName}(id: any) {
        try {
            const query = \`DELETE FROM master.${tableName} WHERE id=$1 RETURNING id\`;
            const result = await ${dbAccess}.query(query, [id]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async createAll${toPlural(entityName)}(records: any[]) {
        const results = [];
        for (const rec of records) {
            const r = await this.create${entityName}(rec);
            results.push(r);
        }
        return results;
    }

    async updateAll${toPlural(entityName)}(records: any[]) {
        const results = [];
        for (const rec of records) {
            const { id, ...data } = rec;
            const r = await this.update${entityName}(id, data);
            results.push(r);
        }
        return results;
    }

    async deleteAll${toPlural(entityName)}(ids: any[]) {
        try {
            const query = \`DELETE FROM master.${tableName} WHERE id = ANY($1::int[]) RETURNING id\`;
            const result = await ${dbAccess}.query(query, [ids]);
            return result?.rows;
        } catch (error) {
            throw error;
        }
    }

    async updateMatching${toPlural(entityName)}(data: any, filters: any, excluded: any[]) {
        return { updated_count: 0 };
    }

    async deleteMatching${toPlural(entityName)}(filters: any, excluded: any[]) {
        return { deleted_count: 0 };
    }

    async import${toPlural(entityName)}(records: any[], options: any = {}) {
        return { inserted_count: records.length };
    }

    async importUpdate${toPlural(entityName)}(updates: any[], options: any = {}) {
        return { updated: updates.length, not_found: 0, errors: [] };
    }
}
`;
}

function generateService(cfg: EntityConfig): string {
  const { entityName } = cfg;

  return `export default class ${entityName}Service {
    get${toPlural(entityName)}: any;
    get${entityName}: any;
    delete${entityName}: any;
    update${entityName}: any;
    create${entityName}: any;
    createAll${toPlural(entityName)}: any;
    updateAll${toPlural(entityName)}: any;
    deleteAll${toPlural(entityName)}: any;
    updateMatching${toPlural(entityName)}: any;
    deleteMatching${toPlural(entityName)}: any;
    import${toPlural(entityName)}: any;
    importUpdate${toPlural(entityName)}: any;
}
`;
}

function generateServiceImpl(cfg: EntityConfig): string {
  const { entityName } = cfg;
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

    async get${toPlural(entityName)}(page: number, limit: number, inputs: any = {}) {
        const offset = (page - 1) * limit;
        const records = await this.repo.get${toPlural(entityName)}(limit, offset, inputs);
        const total = await this.repo.getTotal${toPlural(entityName)}(inputs);
        return {
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

    async createAll${toPlural(entityName)}(records: any[]) {
        return await this.repo.createAll${toPlural(entityName)}(records);
    }

    async updateAll${toPlural(entityName)}(records: any[]) {
        return await this.repo.updateAll${toPlural(entityName)}(records);
    }

    async deleteAll${toPlural(entityName)}(ids: any[]) {
        return await this.repo.deleteAll${toPlural(entityName)}(ids);
    }

    async updateMatching${toPlural(entityName)}(data: any, filters: any, excluded: any[]) {
        return await this.repo.updateMatching${toPlural(entityName)}(data, filters, excluded);
    }

    async deleteMatching${toPlural(entityName)}(filters: any, excluded: any[]) {
        return await this.repo.deleteMatching${toPlural(entityName)}(filters, excluded);
    }

    async import${toPlural(entityName)}(records: any[], options: any) {
        return await this.repo.import${toPlural(entityName)}(records, options);
    }

    async importUpdate${toPlural(entityName)}(updates: any[], options: any) {
        return await this.repo.importUpdate${toPlural(entityName)}(updates, options);
    }
}
`;
}

function generateResponse(cfg: EntityConfig): string {
  return `export class ${cfg.entityName}Response {}
`;
}

function generateController(cfg: EntityConfig): string {
  const { entityName, tableName } = cfg;
  const single = toCamelCase(entityName);
  const plural = toCamelCase(toPlural(entityName));

  return `import { ${entityName}ColumnConfig, ${entityName}ColumnOptionsConfig } from "../config/${single}.column.config.js";
import { ${entityName}ActionsConfig } from "../config/${single}.actions.config.js";
import { ${entityName}HeaderConfig } from "../config/${single}.header.config.js";
import { ${entityName}RowActionsConfig } from "../config/${single}.row-actions.config.js";
import { ${entityName}TableConfig } from "../config/${single}.table.config.js";

export class ${entityName}Controller {

    private readonly service: any;
    private readonly validator: any;

    constructor({ ${single}Service, ${single}Validator }: any) {
        this.service = ${single}Service;
        this.validator = ${single}Validator;
    }

    // ── Table Configurations ──
    async getTableConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}TableConfig });
    }

    async getColumnsConfig(req: any, res: any) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                columns: ${entityName}ColumnConfig,
                options: ${entityName}ColumnOptionsConfig
            }
        });
    }

    async getActionsConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}ActionsConfig });
    }

    async getHeaderConfig(req: any, res: any) {
        return res.status(200).json({ status: "success", code: 200, data: ${entityName}HeaderConfig });
    }

    async getRowActionsConfig(req: any, res: any) {
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
            const id = req.params?.id;
            const data = await this.service.get${entityName}(id);
            return res.status(200).json({ status: "success", code: 200, data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Fetch failed", data: null });
        }
    }

    async list(req: any, res: any) {
        try {
            const page = parseInt(req.query?.page || '1', 10);
            const limit = parseInt(req.query?.limit || '10', 10);
            const result = await this.service.get${toPlural(entityName)}(page, limit, req.query);
            return res.status(200).json({ status: "success", code: 200, data: result.records, pagination: result.pagination });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Listing failed", data: [] });
        }
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
            const records = this.validator.createAll${toPlural(entityName)}(req);
            const data = await this.service.createAll${toPlural(entityName)}(records);
            return res.status(200).json({ status: "success", code: 200, message: "Batch creation successful", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch create failed", data: null });
        }
    }

    async updateAll(req: any, res: any) {
        try {
            const records = this.validator.updateAll${toPlural(entityName)}(req);
            const data = await this.service.updateAll${toPlural(entityName)}(records);
            return res.status(200).json({ status: "success", code: 200, message: "Batch update successful", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch update failed", data: null });
        }
    }

    async deleteAll(req: any, res: any) {
        try {
            const ids = this.validator.deleteAll${toPlural(entityName)}(req);
            const data = await this.service.deleteAll${toPlural(entityName)}(ids);
            return res.status(200).json({ status: "success", code: 200, message: "Batch deletion successful", data });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Batch delete failed", data: null });
        }
    }

    async importCreate(req: any, res: any) {
        try {
            const result = this.validator.importCreate${toPlural(entityName)}(req);
            return res.status(200).json({ status: "success", code: 200, message: "Import parsed successfully", data: result });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import failed", data: null });
        }
    }

    async importUpdate(req: any, res: any) {
        try {
            const result = this.validator.importUpdate${toPlural(entityName)}(req);
            return res.status(200).json({ status: "success", code: 200, message: "Import update parsed successfully", data: result });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "Import update failed", data: null });
        }
    }

    // ── AI Summary & Interact ──
    async aiSummary(req: any, res: any) {
        try {
            const inputs = this.validator.aiSummary(req);
            const isSelected = inputs.selected_row_ids && inputs.selected_row_ids.length > 0;
            const title = isSelected
                ? \`Selected Rows Summary (\${inputs.selected_row_ids.length} \${inputs.selected_row_ids.length > 1 ? '${toPlural(entityName)}' : '${entityName}'})\`
                : "${plural} Table Overview";

            const summary = isSelected
                ? \`Summary of \${inputs.selected_row_ids.length} selected \${inputs.selected_row_ids.length > 1 ? '${toPlural(entityName).toLowerCase()}' : '${entityName.toLowerCase()}'}.\`
                : "This table manages ${plural.toLowerCase()} across the system.";

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI summary generated successfully",
                data: {
                    type: isSelected ? "row_summary" : "table_summary",
                    title,
                    summary,
                    highlights: [
                        \`Record count: \${isSelected ? inputs.selected_row_ids.length : 'All'}\`,
                        \`Filters: \${Object.keys(inputs.active_filters || {}).join(', ') || 'None'}\`
                    ],
                    stats: {
                        count: inputs.selected_row_ids.length,
                        filters: inputs.active_filters
                    },
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
            let reply = "";
            let intent = "general";
            const actions: any = {
                filters: { set: {}, remove: [] },
                proposed_edits: [],
                generated_rows: [],
                requires_user_review: false
            };

            if (query.includes('clear filter') || query.includes('show all')) {
                intent = "filter_remove";
                actions.filters.remove_all = true;
                reply = "Cleared all filters.";
            } else if (query.includes('filter')) {
                intent = "filter_add";
                reply = "Applied filter based on your query.";
            } else if (query.includes('generate')) {
                intent = "generate";
                actions.generated_rows = [
                    {
                        temp_id: \`ai_gen_\${Date.now()}_1\`,
                        status: "active",
                        is_ai_generated: true,
                        needs_review: true
                    }
                ];
                actions.requires_user_review = true;
                reply = "Generated sample draft records for review.";
            } else {
                reply = "AI processed your request for ${tableName}.";
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "AI processed query",
                data: { reply, intent, actions }
            });
        } catch (error: any) {
            return res.status(400).json({ status: "failed", code: 400, message: error?.message ?? "AI interaction failed", data: null });
        }
    }
}
`;
}

function generateRoute(cfg: EntityConfig): string {
  const { entityName, tableName } = cfg;

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

        // ── Configurations ──
        router.get('/${tableName}/config/table', ctrl.getTableConfig.bind(ctrl));
        router.get('/${tableName}/config/columns', ctrl.getColumnsConfig.bind(ctrl));
        router.get('/${tableName}/config/actions', ctrl.getActionsConfig.bind(ctrl));
        router.get('/${tableName}/config/header', ctrl.getHeaderConfig.bind(ctrl));
        router.get('/${tableName}/config/row-actions', ctrl.getRowActionsConfig.bind(ctrl));

        // ── Data Endpoints ──
        router.get('/${tableName}', ctrl.list.bind(ctrl));
        router.get('/${tableName}/:id', ctrl.get.bind(ctrl));
        router.post('/${tableName}/create', ctrl.create.bind(ctrl));
        router.post('/${tableName}/create/all', ctrl.createAll.bind(ctrl));
        router.post('/${tableName}/create/import', upload.single('file'), ctrl.importCreate.bind(ctrl));
        router.put('/${tableName}/update/:id', ctrl.update.bind(ctrl));
        router.put('/${tableName}/update/all', ctrl.updateAll.bind(ctrl));
        router.post('/${tableName}/update/import', upload.single('file'), ctrl.importUpdate.bind(ctrl));
        router.delete('/${tableName}/delete/:id', ctrl.delete.bind(ctrl));
        router.delete('/${tableName}/delete/all', ctrl.deleteAll.bind(ctrl));

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
    console.log(`  ℹ  ${entityName} already registered in register.ts`);
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
  console.log(`Entity:      ${cfg.entityName}`);
  console.log(`Table:       ${cfg.tableName}`);
  console.log(`Module:      ${cfg.moduleName}`);
  console.log(`Product:     ${cfg.productName}`);
  console.log(`Database:    ${cfg.database}`);
  if (cfg.sqlFile) {
    console.log(`SQL Source:  ${cfg.sqlFile}`);
  }
  console.log(`Target Dir:  ${cfg.outputDir}`);
  console.log(`Route Base:  ${cfg.routePrefix}`);
  console.log(`Columns (${cfg.columns.length}):  ${cfg.columns.map(c => `${c.key} (${c.type}/${c.filter_type})`).join(', ')}`);
  console.log(`Mode:        ${cfg.dryRun ? 'DRY RUN (Preview Only - No Files Written)' : 'LIVE WRITE'}`);
  console.log('----------------------------------------------------------------');

  const baseDir = path.resolve(ROOT_DIR, cfg.outputDir);
  const singleKebab = toSnakeCase(cfg.entityName);

  const filesToCreate: { filePath: string; content: string; desc: string }[] = [
    {
      filePath: path.join(baseDir, 'config', `${singleKebab}.table.config.ts`),
      content: generateTableConfig(cfg),
      desc: 'Table Master Configuration'
    },
    {
      filePath: path.join(baseDir, 'config', `${singleKebab}.column.config.ts`),
      content: generateColumnConfig(cfg),
      desc: 'Column & Options Configuration'
    },
    {
      filePath: path.join(baseDir, 'config', `${singleKebab}.header.config.ts`),
      content: generateHeaderConfig(cfg),
      desc: 'Header Sync & Add Dropdown Config'
    },
    {
      filePath: path.join(baseDir, 'config', `${singleKebab}.row-actions.config.ts`),
      content: generateRowActionsConfig(cfg),
      desc: 'Row Actions Configuration'
    },
    {
      filePath: path.join(baseDir, 'config', `${singleKebab}.actions.config.ts`),
      content: generateActionsConfig(cfg),
      desc: 'Action Panel Sections Config'
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

  for (const f of filesToCreate) {
    if (cfg.dryRun) {
      console.log(`[DRY-RUN] Would create: ${path.relative(ROOT_DIR, f.filePath)} (${f.desc})`);
    } else {
      fs.mkdirSync(path.dirname(f.filePath), { recursive: true });
      fs.writeFileSync(f.filePath, f.content, 'utf8');
      console.log(`  ✔  Created: ${path.relative(ROOT_DIR, f.filePath)} (${f.desc})`);
    }
  }

  if (cfg.autoRegister && !cfg.dryRun) {
    console.log('\nMounting Route and Dependency Injections...');
    updatePlatformDbRegister(cfg);
    updateRoutesApi(cfg);
    updatePlatformDbConfig(cfg);
  }

  console.log('----------------------------------------------------------------');
  if (cfg.dryRun) {
    console.log(`✨ Dry run complete! All ${filesToCreate.length} files parsed and validated without changes.`);
  } else {
    console.log(`🎉 Successfully generated complete backend stack for ${cfg.entityName}!`);
    console.log(`Endpoints available under: ${cfg.routePrefix}/${cfg.tableName}`);
  }
  console.log('================================================================\n');
}

run();
