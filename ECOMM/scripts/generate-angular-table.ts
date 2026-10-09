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
    const routeEntryNexora = `    { path: 'nexora/${entitySlug}', component: ${className} },`;
    const routeEntryProduct = `    { path: 'products/${product}/${entitySlug}', component: ${className} },`;

    if (content.includes(`path: 'products/${product}/${entitySlug}'`) && content.includes(`path: 'nexora/${entitySlug}'`)) {
        console.log(`[INFO] Routes for ${entitySlug} already exist in app.routes.ts`);
        return;
    }

    if (dryRun) {
        console.log(`[DRY-RUN] Would add import to app.routes.ts: ${importStmt}`);
        console.log(`[DRY-RUN] Would add route to app.routes.ts: ${routeEntryNexora}`);
        console.log(`[DRY-RUN] Would add route to app.routes.ts: ${routeEntryProduct}`);
        return;
    }

    // Insert import at the top before routes if not present
    if (!content.includes(importStmt)) {
        const lastImportIndex = content.lastIndexOf('import ');
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLastImport + 1) + importStmt + '\n' + content.slice(endOfLastImport + 1);
    }

    // Insert routes before catch-all redirect
    const redirectIndex = content.indexOf("{ path: '',");
    const routesToInsert: string[] = [];
    if (!content.includes(`path: 'nexora/${entitySlug}'`)) routesToInsert.push(routeEntryNexora);
    if (!content.includes(`path: 'products/${product}/${entitySlug}'`)) routesToInsert.push(routeEntryProduct);

    if (routesToInsert.length > 0) {
        const insertionString = routesToInsert.join('\n') + '\n';
        if (redirectIndex !== -1) {
            content = content.slice(0, redirectIndex) + insertionString + content.slice(redirectIndex);
        } else {
            const routesCloseIndex = content.lastIndexOf('];');
            content = content.slice(0, routesCloseIndex) + insertionString + content.slice(routesCloseIndex);
        }
    }

    fs.writeFileSync(routesPath, content, 'utf-8');
    console.log(`[UPDATED] Wired routes into src/app/app.routes.ts:`);
    console.log(`  - /nexora/${entitySlug}`);
    console.log(`  - /products/${product}/${entitySlug}`);
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

    // 2. HTML Template (Full dual-table verification parity with nexora/emp)
    const htmlContent = `<div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased p-6 pb-28 space-y-8">

  <!-- Header Banner Explaining Dual Table Setup -->
  <div class="max-w-[1400px] mx-auto bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="space-y-1">
      <div class="flex items-center gap-2.5">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Dual Table Verification
        </span>
        <span class="text-xs font-mono text-slate-400">table_key: {{ user_table_key }}</span>
      </div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight">{{ title }} — Shared Backend, Isolated UI State</h1>
      <p class="text-xs text-slate-500 max-w-3xl leading-relaxed">
        Both tables share the exact same backend <code class="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px]">table_key: "{{ user_table_key }}"</code>.
        <strong>UI level actions</strong> (collapse, column reordering & visibility, density, selection, filters, sort) remain strictly isolated to each respective table.
        <strong>Backend level actions</strong> (view, delete, edit, create, bulk save) impact and synchronize across both tables.
      </p>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- TABLE 1 (INSTANCE 1)                                            -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div class="max-w-[1400px] mx-auto space-y-2">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">1</span>
        <h2 class="text-sm font-bold text-slate-900 tracking-tight">Table 1</h2>
        <span class="text-[11px] text-slate-400 font-medium">(UI actions here will NOT impact Table 2)</span>
      </div>
      <div class="text-[11px] text-slate-400">
        Try collapsing or changing column order here — Table 2 below stays intact.
      </div>
    </div>

    <master-table 
      [user_table_key]="user_table_key" 
      [user_table_identifier]="table_identifier + '_1'"
      [product]="product"
      [basePath]="basePath"
      instanceId="table-1" 
      instanceLabel="Table 1">
    </master-table>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- VISUAL DIVIDER                                                  -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div class="max-w-[1400px] mx-auto relative py-3">
    <div class="absolute inset-0 flex items-center" aria-hidden="true">
      <div class="w-full border-t-2 border-dashed border-slate-300"></div>
    </div>
    <div class="relative flex justify-center">
      <span class="bg-[#F8FAFC] px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span>▼</span>
        <span>Table 2 Duplicated Below</span>
        <span>▼</span>
      </span>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- TABLE 2 (INSTANCE 2 - DUPLICATED BELOW TABLE 1)                 -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div class="max-w-[1400px] mx-auto space-y-2">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">2</span>
        <h2 class="text-sm font-bold text-slate-900 tracking-tight">Table 2</h2>
        <span class="text-[11px] text-slate-400 font-medium">(Duplicated Instance — Same table_key)</span>
      </div>
      <div class="text-[11px] text-slate-400">
        Backend actions (edit, delete, view, add) here will sync with Table 1.
      </div>
    </div>

    <master-table 
      [user_table_key]="user_table_key" 
      [user_table_identifier]="table_identifier + '_2'"
      [product]="product"
      [basePath]="basePath"
      instanceId="table-2" 
      instanceLabel="Table 2">
    </master-table>
  </div>

</div>
`;

    // 3. Component File
    const componentContent = `import { Component, OnInit, inject, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
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

  @ViewChildren(MasterTableComponent) tables!: QueryList<MasterTableComponent>;

  get table1(): MasterTableComponent | undefined {
    return this.tables?.first;
  }

  get table2(): MasterTableComponent | undefined {
    return this.tables?.last;
  }

  title = '${entityPascal} Management';
  user_table_key = '${cfg.tableKey}';
  table_identifier = '${entitySlug}_instance';
  product = '${cfg.product}';
  basePath = '/${cfg.product.replace(/_/g, '/')}/${entitySlug}';
  tableConfig: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.userTableConfig();
  }

  userTableConfig(): void {
    const configApi = \`http://localhost:3000\${this.basePath}/config/table\`;
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
