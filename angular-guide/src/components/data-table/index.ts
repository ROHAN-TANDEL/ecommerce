/**
 * @module data-table
 *
 * Public API for the granular data-table component library.
 *
 * ─── STRUCTURE ────────────────────────────────────────────────────────────
 *
 *   components/data-table/
 *   │
 *   ├── cell/           CELL level — atomic visual units
 *   │   ├── plain-text.ts        <dt-cell-plain-text>
 *   │   ├── image-text.ts        <dt-cell-image-text>
 *   │   ├── flag-text.ts         <dt-cell-flag-text>
 *   │   ├── number.ts            <dt-cell-number>
 *   │   ├── status-badge.ts      <dt-cell-status-badge>
 *   │   ├── editable.ts          <dt-cell-editable>
 *   │   ├── readonly.ts          <dt-cell-readonly>
 *   │   ├── disabled.ts          <dt-cell-disabled>
 *   │   └── unavailable.ts       <dt-cell-unavailable>
 *   │
 *   ├── row/            ROW level — one component per row state
 *   │   ├── editable.ts          <dt-row-editable>
 *   │   ├── readonly.ts          <dt-row-readonly>
 *   │   ├── disabled.ts          <dt-row-disabled>
 *   │   └── unavailable.ts       <dt-row-unavailable>
 *   │
 *   ├── column/         COLUMN level — vertical contract
 *   │   ├── header.ts            <dt-column-header>
 *   │   ├── fixed.ts             <dt-col-fixed>
 *   │   ├── resizable.ts         <dt-col-resizable>
 *   │   ├── selection.ts         <dt-col-selection>
 *   │   └── action.ts            <dt-col-action>
 *   │
 *   └── table/          TABLE level — global capability & orchestration
 *       ├── data-table.ts        <dt-table>
 *       ├── toolbar.ts           <dt-table-toolbar>
 *       └── lazy-scroll.ts       [dtLazyScroll]
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────
 *
 *   // Full orchestrator
 *   import { DataTable } from '@components/data-table';
 *
 *   // Individual pieces
 *   import { EditableRow, DisabledRow }       from '@components/data-table';
 *   import { StatusBadgeCell, PlainTextCell } from '@components/data-table';
 *   import { ColumnHeader, SortDirection }    from '@components/data-table';
 *   import { RowAction }                      from '@components/data-table';
 */

// ── TABLE ─────────────────────────────────────────────────────────────────
export { DataTable }             from './table/index';
export { MinimizeMaximiseTable } from './table/index';
export { LazyScroll }            from './table/index';

// ── COLUMN ────────────────────────────────────────────────────────────────
export { ColumnHeader }    from './column/index';
export { FixedColumns }    from './column/index';
export { ResizableColumns } from './column/index';
export { SelectionColumn } from './column/index';
export { ActionColumn }    from './column/index';
export type { SortDirection } from './column/index';
export type { RowAction }     from './column/index';

// ── ROW ───────────────────────────────────────────────────────────────────
export { EditableRow }   from './row/index';
export { ReadonlyRow }   from './row/index';
export { DisabledRow }   from './row/index';
export { UnavailableRow } from './row/index';

// ── CELL ──────────────────────────────────────────────────────────────────
export { PlainTextCell }             from './cell/index';
export { ImageAndPlainText }         from './cell/index';
export { FlagAndPlainText }          from './cell/index';
export { NumberSeparationWithComma } from './cell/index';
export { StatusBadgeCell }           from './cell/index';
export { EditableCell }              from './cell/index';
export { ReadonlyCell }              from './cell/index';
export { DisabledCell }              from './cell/index';
export { UnavailableCell }           from './cell/index';
