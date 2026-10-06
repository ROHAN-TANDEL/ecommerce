// ── Strict API Contracts Matching the 3 Configuration Payloads ───────────

export interface TableApiRegistry {
  paginated_data_api: string;
  data_api: string;
  create_api: string;
  create_bulk_api: string;
  create_all_api: string;
  create_import_api: string;
  update_api: string;
  update_bulk_api: string;
  update_all_api: string;
  update_import_api: string;
  delete_api: string;
  delete_bulk_api: string;
  delete_all_api: string;
  column_config_api: string;
  table_config_api: string;
  action_panel_config_api: string;
  table_lock_api: string;
  row_lock_api: string;
  lock_status_api: string;
  export_data_api: string;
  download_data_api: string;
  get_view_api: string;
  save_view_api: string;
  live_talk_api: string;
  live_listen_api: string;
}

export interface TableConfigPayload {
  table_key: string;
  display_name: string;
  add_data_button_name?: string;
  table_api: TableApiRegistry;
  show_title_header_section: boolean;
  enable_add_data_button: boolean;
  show_table_headers: boolean;
  enable_table_search_filters: boolean;
  enable_row_level_checkboxes?: boolean;
  enable_master_level_checkbox?: boolean;
  min_height?: string;
  max_height?: string;
  editable_single_multiple_selected_rows: boolean;
  editable_all_rows: boolean;
  action_panel: boolean;
  action_column: {
    active: boolean;
    options: string[];
  };
  rows: {
    row_expansion: boolean;
    freez: boolean;
  };
  pagination: {
    active: boolean;
    default_page_size: number;
    page_size_options: number[];
  };
}

export interface FilterDataItem {
  key: string;
  name: string;
  type: string;
  default: boolean;
}

export interface ColumnFreezeConfig {
  freez_side: 'left' | 'right';
  order: number;
}

export interface ColumnConfigItem {
  header_name: string;
  filter_key: string;
  columns: Record<string, string>;
  order: number;
  filter_type: 'search' | 'multi_search' | 'list' | 'date_range' | string;
  editable: boolean;
  sorting: boolean;
  column_resize: boolean;
  info_note?: string;
  elipsis?: string;
  active: boolean;
  freez?: ColumnFreezeConfig;
  cell_mode: 'text_code_1000' | 'text_code_2000' | 'text_code_3100' | 'text_code_4000' | string;
  filter_data?: FilterDataItem[];
  width?: string;
}

export type ColumnConfigMap = Record<string, ColumnConfigItem>;

export interface ActionDropdownOption {
  display_name: string;
  info_note?: string;
}

export interface ActionItemConfig {
  name: string;
  component: string;
  active: boolean;
  info_note?: string;
  pinned?: boolean;
  section: string;
  order: number;
  dropdown_default_value?: string;
  dropdown_options?: Record<string, ActionDropdownOption>;
  dynamic_dropdown?: boolean;
}

export interface ActionSectionConfig {
  name: string;
  component: string;
  order: number;
  pinned?: boolean;
}

export interface ActionPanelConfigPayload {
  sections: Record<string, ActionSectionConfig>;
  actions: Record<string, ActionItemConfig>;
}

// ── Enriched View Models for Component Rendering ──────────────────────────

export interface EnrichedColumn extends ColumnConfigItem {
  key: string;
  computedWidth: string;
  stickyLeft?: string;
  isFrozen: boolean;
}

export interface PinnedToolbarAction extends ActionItemConfig {
  key: string;
}

export interface SectionActionGroup {
  sectionKey: string;
  name: string;
  order: number;
  pinned?: boolean;
  actions: Array<ActionItemConfig & { key: string }>;
}

export interface ToastMessage {
  id: number;
  title: string;
  detail?: string;
  source: 'header' | 'toolbar' | 'dropdown' | 'row' | 'filter' | 'pagination';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
