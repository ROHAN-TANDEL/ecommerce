import type { FilterType, EllipsisType, FilterDataItem } from './column-config.model';

/**
 * ColumnDef — the internal, normalised column definition consumed by
 * every component in the data-table library.
 *
 * This is produced by TableApiService.buildColumnDefs() which merges:
 *   - The API column config  (filter_type, editable, sorting, filter_data…)
 *   - Any local overrides    (width, format, frozen, resizable…)
 *
 * Components never receive raw API responses — they always receive ColumnDef[].
 */
export type CellFormat =
  | 'avatar'    // ImageAndPlainText — primary + secondary text with auto-avatar
  | 'flag'      // FlagAndPlainText  — emoji flag + country name
  | 'status'    // StatusBadgeCell   — coloured pill
  | 'number'    // NumberSeparationWithComma — right-aligned formatted number
  | 'boolean'   // rendered as Yes/No badge
  | 'date'      // formatted date string
  | 'link'      // anchor tag
  | 'text';     // PlainTextCell (default)

export type ActionPermission =
  | 'enabled'       // action shown and functional
  | 'disabled'      // action shown but greyed out with tooltip
  | 'not_available'; // action not rendered at all

export interface ColumnDef {
  // ── Identity ──────────────────────────────────────────────────────
  key: string;            // row data accessor key  (e.g. 'customer_name')
  label: string;          // header display text    (from header_name)
  infoNote?: string;      // tooltip on the header  (from info_note)

  // ── Layout ────────────────────────────────────────────────────────
  width: string;          // CSS width e.g. '180px'
  minWidth: string;       // CSS min-width
  maxWidth: string;       // CSS max-width
  defaultWidth: string;   // original width for reset

  // ── Format / Content ──────────────────────────────────────────────
  format: CellFormat;
  ellipsis: EllipsisType;
  secondaryKey?: string;  // avatar secondary line (e.g. 'email' under 'customer_name')
  prefix?: string;        // number cell prefix e.g. '$', '₹'
  suffix?: string;        // number cell suffix e.g. '%'
  decimals?: number;      // number cell decimal places

  // ── Capabilities ──────────────────────────────────────────────────
  visible: boolean;       // show/hide toggle (column management)
  sortable: boolean;
  filterable: boolean;
  editable: boolean;
  resizable: boolean;
  frozen: boolean;
  frozenSide?: 'left' | 'right';
  required: boolean;
  masterEditAllow: boolean; // whether this column participates in master-edit

  // ── Filter ────────────────────────────────────────────────────────
  filterType: FilterType;
  filterData: FilterDataItem[];  // options for list / multi_list / search_list

  // ── Display order ─────────────────────────────────────────────────
  order: number;          // current display order (can be reordered)
}

/** Pagination state passed to/from the table */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Sort state — one entry per active sort column */
export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

/** Filter value state — map of columnKey → raw filter value */
export interface FilterValues {
  [columnKey: string]: any;
}

/** A saved filter preset */
export interface SavedFilter {
  name: string;
  values: FilterValues;
  savedAt: string; // ISO date
}

/** Live collaboration user */
export interface CollabUser {
  id: string;
  name: string;
  initials: string;
  color: string;        // Tailwind bg-* class
  textColor: string;    // Tailwind text-* class
  isEditing: boolean;
  isViewing: boolean;
}

/** Per-row action permission map — keyed by action key */
export interface RowActionPermissions {
  edit: ActionPermission;
  delete: ActionPermission;
  enable: ActionPermission;
  disable: ActionPermission;
  revert: ActionPermission;
}
