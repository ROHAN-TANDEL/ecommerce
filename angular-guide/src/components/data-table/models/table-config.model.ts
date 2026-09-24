/**
 * TableConfigModel — shape of the table-config API response
 *
 * GET /customers/table-config
 * Returns a single key (table unique key) wrapping all capability flags.
 *
 * Every boolean flag on this model drives a feature in the orchestrator.
 * Nothing is hardcoded in the component — it all flows from this config.
 */

export interface SelectionConfig {
  enabled: boolean;
  multiple: boolean;
}

export interface PaginationConfig {
  enabled: boolean;
  default_page_size: number;
  page_size_options: number[];
}

export interface SortingConfig {
  enabled: boolean;
  multiple: boolean;
}

export interface FilteringConfig {
  enabled: boolean;
}

export interface EditingConfig {
  enabled: boolean;
  row_editable: boolean;
}

export interface ActionsConfig {
  edit: boolean;
  delete: boolean;
  enable: boolean;
  disable: boolean;
  revert: boolean;
  more: boolean;
}

export interface ExportConfig {
  enabled: boolean;
  formats: Array<'excel' | 'csv'>;
}

export interface DownloadConfig {
  enabled: boolean;
  formats: Array<'excel' | 'csv'>;
}

export interface ColumnManagementConfig {
  enabled: boolean;
  reorder: boolean;
  show_hide: boolean;
}

export interface ColumnFreezeConfig {
  enabled: boolean;
  start: number; // number of columns frozen from the left
  end: number;   // number of columns frozen from the right
}

export interface RowFreezeConfig {
  enabled: boolean;
  top: number;
  bottom: number;
}

export interface ColumnResizeConfig {
  enabled: boolean;
}

export interface ViewConfig {
  fullscreen: boolean;
  density: boolean;
  default_density: 'compact' | 'comfortable' | 'spacious';
}

export interface LiveCollaborationConfig {
  enabled: boolean;
}

export interface FeaturesConfig {
  column_navigation: boolean;
  column_count_indicator: boolean;
  save_view: boolean;
  reset_view: boolean;
}

/** Shape of one table entry within the table-config response */
export interface TableConfigEntry {
  table_name: string;
  display_name: string;
  data_api: string;
  update_api: string;
  config_api: string;
  table_config_api: string;
  primary_key: string;
  /** Whether to show the checkbox column at all */
  show_checkboxes?: boolean;
  /** Whether to show the actions column at all */
  show_actions?: boolean;
  /** Whether to show the headers section (header row, filter row, master-edit row) */
  show_headers?: boolean;
  /** Whether to show the live-count / collaboration panel */
  live_count_panel?: boolean;
  /** Whether to show the main action toolbar panel */
  main_action_panel?: boolean;
  /** Whether the checkbox column is sticky (fixed) while scrolling horizontally */
  fixed_checkboxes?: boolean;
  /** Whether the actions column is sticky (fixed) at the far right while scrolling */
  fixed_actions?: boolean;
  selection: SelectionConfig;
  pagination: PaginationConfig;
  sorting: SortingConfig;
  filtering: FilteringConfig;
  editing: EditingConfig;
  actions: ActionsConfig;
  export: ExportConfig;
  download: DownloadConfig;
  column_management: ColumnManagementConfig;
  column_freeze: ColumnFreezeConfig;
  row_freeze: RowFreezeConfig;
  column_resize: ColumnResizeConfig;
  view: ViewConfig;
  live_collaboration: LiveCollaborationConfig;
  features: FeaturesConfig;
}

/** Full table-config API response — a map of tableUniqueKey → TableConfigEntry */
export type TableConfigResponse = Record<string, TableConfigEntry>;
