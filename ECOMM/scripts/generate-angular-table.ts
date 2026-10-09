import * as fs from 'fs';
import * as path from 'path';

// Locate root and angular workspace
const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const BACKEND_ROOT = path.resolve(SCRIPT_DIR, '..');
const ANGULAR_ROOT = path.resolve(BACKEND_ROOT, '..', 'angular-guide');

function toPascalCase(str: string): string {
    return str
        .replace(/[-_ ]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, c => c.toUpperCase());
}

function toCamelCase(str: string): string {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
}

function toPlural(str: string): string {
    const lower = str.toLowerCase();
    if (lower.endsWith('y') && !/[aeiou]y$/.test(lower)) {
        return lower.slice(0, -1) + 'ies';
    }
    if (lower.endsWith('s') || lower.endsWith('sh') || lower.endsWith('ch') || lower.endsWith('x') || lower.endsWith('z')) {
        return lower + 'es';
    }
    return lower + 's';
}

function parseSqlColumns(sqlContent: string): { name: string; type: string }[] {
    const cols: { name: string; type: string }[] = [];
    const createTableMatch = sqlContent.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([^\s(]+)\s*\(([\s\S]+?)\)\s*;/i);
    if (!createTableMatch) return cols;

    const body = createTableMatch[2];
    const lines = body.split('\n');

    for (const rawLine of lines) {
        const line = rawLine.trim().replace(/--.*$/, '').replace(/,$/, '');
        if (!line) continue;
        if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT|UNIQUE|CHECK|CREATE\s+INDEX)/i.test(line)) continue;

        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
            const colName = parts[0].replace(/["`]/g, '');
            if (colName.toLowerCase() === 'id') continue;
            const sqlColType = parts[1].toUpperCase();

            let tsType = 'string';
            if (sqlColType.includes('INT') || sqlColType.includes('NUMERIC') || sqlColType.includes('DECIMAL') || sqlColType.includes('FLOAT') || sqlColType.includes('DOUBLE')) {
                tsType = 'number';
            } else if (sqlColType.includes('BOOL')) {
                tsType = 'boolean';
            } else if (sqlColType.includes('DATE') || sqlColType.includes('TIMESTAMP')) {
                tsType = 'string';
            }

            cols.push({ name: colName, type: tsType });
        }
    }
    return cols;
}

interface GeneratorConfig {
    entity: string;
    tableKey: string;
    product: string;
    sqlPath?: string;
    dryRun: boolean;
}

function parseCliArgs(): GeneratorConfig {
    const args = process.argv.slice(2);
    let entity = 'Customer';
    let tableKey = '';
    let product = 'identity_management';
    let sqlPath = '';
    let dryRun = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--entity' && i + 1 < args.length) {
            entity = args[++i];
        } else if (arg === '--table-key' && i + 1 < args.length) {
            tableKey = args[++i];
        } else if (arg === '--product' && i + 1 < args.length) {
            product = args[++i];
        } else if (arg === '--sql' && i + 1 < args.length) {
            sqlPath = args[++i];
        } else if (arg === '--dry-run') {
            dryRun = true;
        }
    }

    if (sqlPath && !args.includes('--entity')) {
        const sqlResolved = path.isAbsolute(sqlPath) ? sqlPath : path.resolve(BACKEND_ROOT, sqlPath);
        if (fs.existsSync(sqlResolved)) {
            const content = fs.readFileSync(sqlResolved, 'utf-8');
            const match = content.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:master\.|public\.)?([^\s(]+)/i);
            if (match) {
                const rawTable = match[1].replace(/["`]/g, '');
                entity = toPascalCase(rawTable.replace(/s$/, ''));
            }
        }
    }

    if (!tableKey) {
        tableKey = `${toPlural(entity.toLowerCase())}_table_1234`;
    }

    return { entity, tableKey, product, sqlPath, dryRun };
}

function updateAngularRoutes(entityName: string, entitySlug: string, product: string, dryRun: boolean): void {
    const routesPath = path.resolve(ANGULAR_ROOT, 'src/app/app.routes.ts');
    if (!fs.existsSync(routesPath)) {
        console.warn(`[WARN] Routes file not found at: ${routesPath}`);
        return;
    }

    let content = fs.readFileSync(routesPath, 'utf-8');
    const className = toPascalCase(entityName);
    const importStmt = `import { ${className} } from './products/${product}/${entitySlug}/${entitySlug}';`;
    const routeEntry = `    { path: 'products/${product}/${entitySlug}', component: ${className} },`;

    if (content.includes(`path: 'products/${product}/${entitySlug}'`)) {
        console.log(`[INFO] Route for products/${product}/${entitySlug} already exists in app.routes.ts`);
        return;
    }

    if (dryRun) {
        console.log(`[DRY-RUN] Would add import to app.routes.ts: ${importStmt}`);
        console.log(`[DRY-RUN] Would add route to app.routes.ts: ${routeEntry}`);
        return;
    }

    // Insert import at the top before routes
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStmt + '\n' + content.slice(endOfLastImport + 1);

    // Insert route before catch-all redirect
    const redirectIndex = content.indexOf("{ path: '',");
    if (redirectIndex !== -1) {
        content = content.slice(0, redirectIndex) + routeEntry + '\n' + content.slice(redirectIndex);
    } else {
        const routesCloseIndex = content.lastIndexOf('];');
        content = content.slice(0, routesCloseIndex) + routeEntry + '\n' + content.slice(routesCloseIndex);
    }

    fs.writeFileSync(routesPath, content, 'utf-8');
    console.log(`[UPDATED] Wired route into src/app/app.routes.ts: /products/${product}/${entitySlug}`);
}

function generateAngularTable(): void {
    const cfg = parseCliArgs();
    const entityPascal = toPascalCase(cfg.entity);
    const entitySlug = toSnakeCase(toPlural(cfg.entity));
    const targetDir = path.resolve(ANGULAR_ROOT, 'src/app/products', cfg.product, entitySlug);

    console.log('================================================================');
    console.log('🚀 ANTIGRAVITY ANGULAR MASTER-TABLE GENERATOR');
    console.log('================================================================');
    console.log(`Entity:      ${entityPascal}`);
    console.log(`Table Key:   ${cfg.tableKey}`);
    console.log(`Product:     ${cfg.product}`);
    console.log(`Target Dir:  ${path.relative(ANGULAR_ROOT, targetDir)}`);
    console.log(`Route:       /products/${cfg.product}/${entitySlug}`);
    console.log(`Mode:        ${cfg.dryRun ? 'DRY RUN (Preview Only)' : 'LIVE WRITE'}`);
    console.log('----------------------------------------------------------------');

    // Parse columns from SQL if provided
    let columns: { name: string; type: string }[] = [];
    if (cfg.sqlPath) {
        const sqlResolved = path.isAbsolute(cfg.sqlPath) ? cfg.sqlPath : path.resolve(BACKEND_ROOT, cfg.sqlPath);
        if (fs.existsSync(sqlResolved)) {
            const sqlContent = fs.readFileSync(sqlResolved, 'utf-8');
            columns = parseSqlColumns(sqlContent);
            console.log(`Parsed SQL Columns (${columns.length}): ${columns.map(c => `${c.name} (${c.type})`).join(', ')}`);
        }
    }

    // 1. Types File
    const typesContent = `export interface ${entityPascal}Item {
  id?: number | string;
${columns.length > 0 ? columns.map(c => `  ${c.name}?: ${c.type};`).join('\n') : `  name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;`}
  [key: string]: any;
}

export interface ${entityPascal}FilterPayload {
  [key: string]: any;
}
`;

    // 2. HTML Template
    const htmlContent = `<div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased p-6 pb-28 space-y-8">

  <!-- Header Banner -->
  <div class="max-w-[1400px] mx-auto bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="space-y-1">
      <div class="flex items-center gap-2.5">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          ${entityPascal} Management
        </span>
        <span class="text-xs font-mono text-slate-400">table_key: {{ user_table_key }}</span>
      </div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight">${entityPascal} Records</h1>
      <p class="text-xs text-slate-500">
        Decoupled Master Table with dynamic API bootstrap, column options, filters, and isolated UI state.
      </p>
    </div>
  </div>

  <!-- Master Table Instance -->
  <div class="max-w-[1400px] mx-auto space-y-2">
    <master-table 
      [user_table_key]="user_table_key" 
      [user_table_identifier]="table_identifier">
    </master-table>
  </div>

</div>
`;

    // 3. Component File
    const componentContent = `import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MasterTableComponent } from '../../../pages/employees/employee-table.component';

@Component({
  selector: 'app-${entitySlug}',
  standalone: true,
  imports: [
    CommonModule,
    MasterTableComponent,
  ],
  templateUrl: './${entitySlug}.html',
})
export class ${entityPascal} implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  title = '${entityPascal}';
  user_table_key = '${cfg.tableKey}';
  table_identifier = '${entitySlug}_instance_1';
  tableConfig: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.userTableConfig();
  }

  userTableConfig(): void {
    const configApi = \`http://localhost:3000/identity/management/${entitySlug}/config/table\`;
    this.isLoading = true;

    this.http.get<any>(configApi).subscribe({
      next: (res) => {
        const configData = res?.data || res;
        this.tableConfig = configData;
        if (configData?.table_key) {
          this.user_table_key = configData.table_key;
        }
        if (configData?.display_name) {
          this.title = configData.display_name;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('[${entityPascal}] Could not fetch table config from API, using defaults', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
`;

    const filesToWrite = [
        { name: `${entitySlug}.types.ts`, content: typesContent, desc: 'TypeScript Data Interfaces' },
        { name: `${entitySlug}.html`, content: htmlContent, desc: 'Angular HTML View Template' },
        { name: `${entitySlug}.ts`, content: componentContent, desc: 'Standalone Component Controller' },
    ];

    if (cfg.dryRun) {
        for (const f of filesToWrite) {
            console.log(`[DRY-RUN] Would create: ${path.join(targetDir, f.name)} (${f.desc})`);
        }
        updateAngularRoutes(entityPascal, entitySlug, cfg.product, true);
        console.log('----------------------------------------------------------------');
        console.log('✨ Dry run complete! All files validated without changes.');
        console.log('================================================================');
        return;
    }

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const f of filesToWrite) {
        const fullPath = path.join(targetDir, f.name);
        fs.writeFileSync(fullPath, f.content, 'utf-8');
        console.log(`[CREATED] ${fullPath} (${f.desc})`);
    }

    updateAngularRoutes(entityPascal, entitySlug, cfg.product, false);

    console.log('----------------------------------------------------------------');
    console.log(`🎉 Master Table successfully generated for ${entityPascal}!`);
    console.log(`Access at: /nexora/${entitySlug}`);
    console.log('================================================================');
}

generateAngularTable();
