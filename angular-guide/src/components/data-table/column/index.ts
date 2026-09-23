/**
 * column/  —  COLUMN level
 *
 * The vertical contract layer — defines capability and presentation
 * for all cells within a column, and all header variants.
 *
 *   dt-column-header   ColumnHeader    header.ts    standard sortable/filterable <th>
 *   dt-col-fixed       FixedColumns    fixed.ts     sticky/frozen <th>
 *   dt-col-resizable   ResizableColumns resizable.ts drag-to-resize <th>
 *   dt-col-selection   SelectionColumn selection.ts master-checkbox <th>
 *   dt-col-action      ActionColumn    action.ts    per-row action <td>
 *
 * SortDirection and RowAction are exported as types for consumer use.
 */
export { ColumnHeader }              from './header';
export type { SortDirection }        from './header';
export { FixedColumns }              from './fixed';
export { ResizableColumns }          from './resizable';
export { SelectionColumn }           from './selection';
export { ActionColumn }              from './action';
export type { RowAction }            from './action';
