/**
 * ColumnConfigModel — shape of a single column entry from GET /customers/config
 *
 * Example:
 * {
 *   "customer_name": {
 *     "header_name": "Customer",
 *     "columns": { "customers": "customer_name" },
 *     "filter_type": "search",
 *     "editable": true,
 *     "sorting": true,
 *     "info_note": "Customer's registered business name",
 *     "elipsis": "text_elipsis",
 *     "active": true,
 *     "show": true,
 *     "master_edit_allow": true,
 *     "filter_data": []
 *   }
 * }
 */

export type FilterType =
  | 'search'
  | 'list'
  | 'search_list'
  | 'multi_list'
  | 'range'
  | 'date_range'
  | 'bool'
  | 'none';

export type EllipsisType = 'text_elipsis' | 'number_elipsis';

export interface FilterDataItem {
  key: string;
  name: string;
  type: 'check_box' | 'radio' | 'text';
  default: boolean;
}

export interface ColumnTableRef {
  [tableName: string]: string; // e.g. { customers: 'customer_name' }
}

export interface ColumnConfigItem {
  header_name: string;
  columns: ColumnTableRef;
  filter_type: FilterType;
  editable: boolean;
  sorting: boolean;
  info_note?: string;
  elipsis: EllipsisType;
  active: boolean;
  show: boolean;
  master_edit_allow: boolean;
  filter_data: FilterDataItem[];
}

/** Full config API response — a map of fieldKey → ColumnConfigItem */
export type ColumnConfigResponse = Record<string, ColumnConfigItem>;
