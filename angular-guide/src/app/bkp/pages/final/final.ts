import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorizontalSection } from '../../../components/layouts/horizontal-section/horizontal-section';
import { VerticalSection } from '../../../components/layouts/vertical-section/vertical-section';
import {
  AutoRefreshComponent,
  LockUpdateComponent,
  DensityComponent,
  ExportActionComponent,
  DownloadActionComponent,
  ColumnsManagerComponent,
  ColumnNavComponent,
  ViewsManagerComponent,
  FullscreenToggleComponent,
  CollapseToggleComponent,
  CollabToggleComponent,
  ActionButtonComponent,
} from '../../../components/data-table/table';
import type { TableDensity } from '../../../components/data-table/table/density';
import type { ExportFormat } from '../../../components/data-table/table/export-action';
import type { DownloadFormat } from '../../../components/data-table/table/download-action';

// Nexora Inputs Vocabulary components
import {
  NexoraTextInputComponent,
  NexoraTextareaInputComponent,
  NexoraSearchInputComponent,
  NexoraEmailInputComponent,
  NexoraPasswordInputComponent,
  NexoraUrlInputComponent,
  NexoraPhoneInputComponent,
  NexoraNumberInputComponent,
  NexoraDecimalInputComponent,
  NexoraCurrencyInputComponent,
  NexoraPercentageInputComponent,
  NexoraSliderInputComponent,
  NexoraNumberRangeInputComponent,
  NexoraSelectInputComponent,
  NexoraMultiSelectInputComponent,
  NexoraAutocompleteInputComponent,
  NexoraTagInputComponent,
  NexoraRadioGroupInputComponent,
  NexoraCheckboxInputComponent,
  NexoraCheckboxGroupInputComponent,
  NexoraToggleInputComponent,
  NexoraDatePickerInputComponent,
  NexoraDateRangeInputComponent,
  NexoraMonthPickerInputComponent,
  NexoraYearPickerInputComponent,
  NexoraTimePickerInputComponent,
  NexoraDatetimePickerInputComponent,
  NexoraDatetimeRangeInputComponent,
  NexoraFileUploadInputComponent,
  NexoraImageUploadInputComponent,
  NexoraColorPickerInputComponent,
  NexoraRatingInputComponent,
  NexoraOtpInputComponent,
  NexoraRichTextInputComponent,
  NexoraCodeEditorInputComponent,
  NexoraCellTextComponent,
  NexoraCellNumberComponent,
  NexoraCellSelectComponent,
  NexoraCellCheckboxComponent,
  NexoraCellToggleComponent,
  NexoraCellDateComponent,
  NexoraCellBadgeComponent,
  NexoraCellUserComponent,
  NexoraCellProgressComponent,
  NexoraCellSparklineComponent,
} from '../../../components/nexora-inputs';

// Nexora UI Element Families components
import {
  // Buttons
  NexoraButtonComponent,
  NexoraButtonGroupComponent,
  NexoraToggleButtonComponent,
  NexoraSplitButtonComponent,
  NexoraDropdownButtonComponent,
  NexoraFabComponent,
  // Navigation
  NexoraTabsComponent,
  NexoraSegmentedComponent,
  NexoraBreadcrumbsComponent,
  NexoraPaginationComponent,
  NexoraStepperComponent,
  // Feedback & Status
  NexoraAlertComponent,
  NexoraBannerComponent,
  NexoraToastComponent,
  NexoraSpinnerComponent,
  NexoraLoadingOverlayComponent,
  NexoraSkeletonComponent,
  // Overlays
  NexoraModalComponent,
  NexoraConfirmDialogComponent,
  NexoraDrawerComponent,
  NexoraPopoverComponent,
  NexoraTooltipComponent,
  // Data Display
  NexoraStatCardComponent,
  NexoraCardComponent,
  NexoraTimelineComponent,
  NexoraAccordionComponent,
  NexoraDescriptionListComponent,
  // 6. Selection/Display Combinations
  NexoraUserSelectorComponent,
  NexoraChipSelectorComponent,
  NexoraIconSelectorComponent,
  NexoraCascadingSelectorComponent,
  // 7. Search and Filtering
  NexoraSearchBarComponent,
  NexoraFilterChipComponent,
  NexoraFilterGroupComponent,
  NexoraFilterBuilderComponent,
  NexoraSortControlComponent,
  NexoraQuickFiltersComponent,
  // 8. Tags, Badges and Labels
  NexoraStatusBadgeComponent,
  NexoraBadgeComponent,
  NexoraCountBadgeComponent,
  NexoraNotificationBadgeComponent,
  NexoraChipComponent,
  NexoraPresenceIndicatorComponent,
  // 9. File/Document UI
  NexoraDropzoneComponent,
  NexoraFileCardComponent,
  NexoraAttachmentItemComponent,
  NexoraAttachmentListComponent,
  // 10. User/Entity Representations
  NexoraAvatarComponent,
  NexoraAvatarGroupComponent,
  NexoraUserIdentityComponent,
  NexoraUserCardComponent,
  NexoraOrgIdentityComponent,
  NexoraEntityCardComponent,
} from '../../../components/nexora-ui';

@Component({
  selector: 'app-final',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HorizontalSection,
    VerticalSection,
    // Table Action components
    AutoRefreshComponent,
    LockUpdateComponent,
    DensityComponent,
    ExportActionComponent,
    DownloadActionComponent,
    ColumnsManagerComponent,
    ColumnNavComponent,
    ViewsManagerComponent,
    FullscreenToggleComponent,
    CollapseToggleComponent,
    CollabToggleComponent,
    ActionButtonComponent,
    // Nexora Input Vocabulary components
    NexoraTextInputComponent,
    NexoraTextareaInputComponent,
    NexoraSearchInputComponent,
    NexoraEmailInputComponent,
    NexoraPasswordInputComponent,
    NexoraUrlInputComponent,
    NexoraPhoneInputComponent,
    NexoraNumberInputComponent,
    NexoraDecimalInputComponent,
    NexoraCurrencyInputComponent,
    NexoraPercentageInputComponent,
    NexoraSliderInputComponent,
    NexoraNumberRangeInputComponent,
    NexoraSelectInputComponent,
    NexoraMultiSelectInputComponent,
    NexoraAutocompleteInputComponent,
    NexoraTagInputComponent,
    NexoraRadioGroupInputComponent,
    NexoraCheckboxInputComponent,
    NexoraCheckboxGroupInputComponent,
    NexoraToggleInputComponent,
    NexoraDatePickerInputComponent,
    NexoraDateRangeInputComponent,
    NexoraMonthPickerInputComponent,
    NexoraYearPickerInputComponent,
    NexoraTimePickerInputComponent,
    NexoraDatetimePickerInputComponent,
    NexoraDatetimeRangeInputComponent,
    NexoraFileUploadInputComponent,
    NexoraImageUploadInputComponent,
    NexoraColorPickerInputComponent,
    NexoraRatingInputComponent,
    NexoraOtpInputComponent,
    NexoraRichTextInputComponent,
    NexoraCodeEditorInputComponent,
    NexoraCellTextComponent,
    NexoraCellNumberComponent,
    NexoraCellSelectComponent,
    NexoraCellCheckboxComponent,
    NexoraCellToggleComponent,
    NexoraCellDateComponent,
    NexoraCellBadgeComponent,
    NexoraCellUserComponent,
    NexoraCellProgressComponent,
    NexoraCellSparklineComponent,
    // Nexora UI Element Families components
    NexoraButtonComponent,
    NexoraButtonGroupComponent,
    NexoraToggleButtonComponent,
    NexoraSplitButtonComponent,
    NexoraDropdownButtonComponent,
    NexoraFabComponent,
    NexoraTabsComponent,
    NexoraSegmentedComponent,
    NexoraBreadcrumbsComponent,
    NexoraPaginationComponent,
    NexoraStepperComponent,
    NexoraAlertComponent,
    NexoraBannerComponent,
    NexoraToastComponent,
    NexoraSpinnerComponent,
    NexoraLoadingOverlayComponent,
    NexoraSkeletonComponent,
    NexoraModalComponent,
    NexoraConfirmDialogComponent,
    NexoraDrawerComponent,
    NexoraPopoverComponent,
    NexoraTooltipComponent,
    NexoraStatCardComponent,
    NexoraCardComponent,
    NexoraTimelineComponent,
    NexoraAccordionComponent,
    NexoraDescriptionListComponent,
    // 6. Selection/Display Combinations
    NexoraUserSelectorComponent,
    NexoraChipSelectorComponent,
    NexoraIconSelectorComponent,
    NexoraCascadingSelectorComponent,
    // 7. Search and Filtering
    NexoraSearchBarComponent,
    NexoraFilterChipComponent,
    NexoraFilterGroupComponent,
    NexoraFilterBuilderComponent,
    NexoraSortControlComponent,
    NexoraQuickFiltersComponent,
    // 8. Tags, Badges and Labels
    NexoraStatusBadgeComponent,
    NexoraBadgeComponent,
    NexoraCountBadgeComponent,
    NexoraNotificationBadgeComponent,
    NexoraChipComponent,
    NexoraPresenceIndicatorComponent,
    // 9. File/Document UI
    NexoraDropzoneComponent,
    NexoraFileCardComponent,
    NexoraAttachmentItemComponent,
    NexoraAttachmentListComponent,
    // 10. User/Entity Representations
    NexoraAvatarComponent,
    NexoraAvatarGroupComponent,
    NexoraUserIdentityComponent,
    NexoraUserCardComponent,
    NexoraOrgIdentityComponent,
    NexoraEntityCardComponent,
  ],
  templateUrl: './final.html',
  styleUrl: './final.css'
})
export class Final {
  activeTab: 'inputs' | 'ui-elements' | 'actions' = 'inputs';

  // --- Input State Demo Values ---
  // 1. Text Inputs
  textVal = 'Acme Global Holdings';
  textareaVal = 'Enterprise grade customer intelligence platform with automated compliance checks.';
  searchVal = 'Search active customers...';
  emailVal = 'sarah.connor@acme.io';
  passwordVal = 'SuperSecret123!';
  urlVal = 'app.nexora.io/analytics';
  phoneVal = '9876543210';
  phoneCode = '+1';

  // 2. Numeric Inputs
  numberVal = 42;
  decimalVal = 1249.99;
  currencyVal = 45999;
  percentageVal = 78.5;
  sliderVal = 65;
  minRangeVal: number | null = 100;
  maxRangeVal: number | null = 500;

  // 3. Selection Inputs
  selectVal = 'prod';
  selectOptions = [
    { label: 'Production Tier', value: 'prod', icon: 'fa fa-server' },
    { label: 'Staging Sandbox', value: 'stage', icon: 'fa fa-vial' },
    { label: 'Development Local', value: 'dev', icon: 'fa fa-code' },
    { label: 'Archived Cold', value: 'archive', icon: 'fa fa-archive', disabled: true }
  ];

  multiSelectVals = ['frontend', 'angular'];
  multiSelectOptions = [
    { label: 'Angular 19', value: 'angular' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Frontend UI', value: 'frontend' },
    { label: 'TailwindCSS', value: 'tailwind' },
    { label: 'GraphQL API', value: 'graphql' }
  ];

  autocompleteVal = 'Sarah Jenkins';
  autocompleteItems = [
    { id: 1, label: 'Sarah Jenkins', sublabel: 'sarah.j@nexora.io (Lead Designer)' },
    { id: 2, label: 'Michael Chen', sublabel: 'chen.m@nexora.io (Engineering Dir)' },
    { id: 3, label: 'Alex Morales', sublabel: 'alex.m@nexora.io (DevOps Lead)' },
    { id: 4, label: 'Jessica Taylor', sublabel: 'jess.t@nexora.io (Product Owner)' }
  ];

  tags = ['Enterprise', 'Priority', 'SaaS', 'Q3-Release'];

  radioVal = 'quarterly';
  radioOptions = [
    { label: 'Monthly Billing', value: 'monthly', description: 'Pay every month, cancel anytime' },
    { label: 'Quarterly Billing', value: 'quarterly', description: 'Save 10% on quarterly prepaid' },
    { label: 'Annual Enterprise', value: 'annual', description: 'Save 25% + dedicated support' }
  ];

  singleCheck = true;
  checkboxGroupVals = ['notifications', 'analytics'];
  checkboxGroupOptions = [
    { label: 'Email Notifications', value: 'notifications', description: 'Instant alerts on sync' },
    { label: 'Usage Analytics', value: 'analytics', description: 'Telemetry reports' },
    { label: 'Beta Program Access', value: 'beta', description: 'Early preview features' }
  ];

  toggleVal = true;

  // 4. Datetime Inputs
  dateVal = '2026-10-15';
  startDateVal = '2026-10-01';
  endDateVal = '2026-10-31';
  monthVal = '2026-10';
  yearVal = 2026;
  timeVal = '14:30';
  datetimeVal = '2026-10-15T14:30';
  startDateTimeVal = '2026-10-01T09:00';
  endDateTimeVal = '2026-10-15T18:00';

  // 5. Special Inputs
  uploadedFiles = [
    { name: 'quarterly_report_2026.pdf', size: '2.4 MB' },
    { name: 'architecture_diagram.svg', size: '412 KB' }
  ];
  avatarImageUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces';
  selectedColor = '#436CF3';
  ratingVal = 4;
  otpCode = '824915';
  richTextContent = '<p>Welcome to <strong>Nexora UI</strong>! This component supports <em>formatting</em> and lists.</p>';
  codeSnippet = `{\n  "service": "nexora-engine",\n  "status": "healthy",\n  "cluster": "us-east-1",\n  "activeNodes": 12\n}`;

  // 6. Inline Table Sample Rows
  inlineRows = [
    { id: 1, name: 'Stripe Payments', userEmail: 'stripe@fintech.io', amount: 4500, status: 'Active', category: 'finance', enabled: true, date: '2026-10-12', progress: 85, trend: [10, 14, 18, 15, 22, 28] },
    { id: 2, name: 'AWS Cloud Sync', userEmail: 'cloud@aws.amazon.com', amount: 12200, status: 'Pending', category: 'infra', enabled: true, date: '2026-10-14', progress: 42, trend: [20, 18, 15, 12, 10, 8] },
    { id: 3, name: 'SendGrid Dispatch', userEmail: 'smtp@sendgrid.net', amount: 890, status: 'Active', category: 'comms', enabled: false, date: '2026-10-18', progress: 95, trend: [5, 9, 12, 18, 24, 30] },
    { id: 4, name: 'Datadog Monitors', userEmail: 'telemetry@datadoghq.com', amount: 3400, status: 'Error', category: 'infra', enabled: false, date: '2026-10-20', progress: 18, trend: [15, 14, 13, 11, 7, 4] }
  ];

  inlineSelectOptions = [
    { label: 'Finance', value: 'finance' },
    { label: 'Infrastructure', value: 'infra' },
    { label: 'Communications', value: 'comms' }
  ];

  // --- UI Elements State Demo Values ---
  // 1. Buttons
  btnLoadingState = false;
  toggleBtnActive = true;
  splitActions = [
    { id: 'draft', label: 'Save as Draft', icon: '📝' },
    { id: 'publish', label: 'Publish to Staging', icon: '🚀' },
    { id: 'archive', label: 'Archive Record', icon: '🗑', danger: true },
  ];
  dropdownActions = [
    { id: 'duplicate', label: 'Duplicate Entry', icon: '📋' },
    { id: 'export-csv', label: 'Export as CSV', icon: '📊' },
    { id: 'delete', label: 'Delete Entry', icon: '✕', danger: true },
  ];
  buttonGroupVal = 'grid';
  buttonGroupOptions = [
    { label: 'Grid', value: 'grid', icon: '▦' },
    { label: 'Table', value: 'table', icon: '☰' },
    { label: 'Kanban', value: 'kanban', icon: '🗂' },
  ];

  // 2. Navigation
  activeTabId = 'users';
  navTabs = [
    { id: 'users', label: 'Users', icon: '👥', badge: '128' },
    { id: 'roles', label: 'Roles', icon: '🛡', badge: '12' },
    { id: 'permissions', label: 'Permissions', icon: '🔑' },
    { id: 'audit', label: 'Audit Log', icon: '📜' }
  ];
  segmentedVal = 'week';
  segmentedOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];
  breadcrumbs = [
    { label: 'Home', icon: '🏠' },
    { label: 'Settings' },
    { label: 'Access Control' },
    { label: 'Permissions' },
  ];
  currPage = 2;
  currStep = 2;
  wizardSteps = [
    { id: 1, label: 'Identity', description: 'Personal info' },
    { id: 2, label: 'Security', description: 'MFA & passwords' },
    { id: 3, label: 'Review', description: 'Confirm plan' },
  ];

  // 3. Feedback
  showBannerAlert = true;
  showToastDemo = true;
  isOverlayLoading = false;

  // 4. Overlays
  isModalOpen = false;
  isConfirmOpen = false;
  isDrawerOpen = false;

  // 5. Data Display
  timelineItems = [
    { id: 1, title: 'Deployed v2.4 to Production', description: 'Zero downtime rolling update across 8 nodes.', timestamp: '12m ago', user: 'DevOps Bot', status: 'success' as const },
    { id: 2, title: 'Database Migration Completed', description: 'Added 4 new columns to user_roles table.', timestamp: '1h ago', user: 'Alex M.', status: 'info' as const },
    { id: 3, title: 'High Memory Spike Alert', description: 'Node worker-03 reached 88% memory saturation.', timestamp: '3h ago', user: 'Monitoring', status: 'warning' as const },
  ];
  accordionList = [
    { id: '1', title: 'What is the Nexora Vocabulary Architecture?', content: 'Nexora is a declarative, design-tokenized component system built with standalone Angular components and Tailwind CSS.', open: true },
    { id: '2', title: 'How do inline table cells manage edits?', content: 'Each inline cell component provides seamless ghost-hover states and emits direct two-way model bindings without re-rendering the whole row.' },
    { id: '3', title: 'Can overlays be nested?', content: 'Yes, modal dialogues, slide-out drawers, tooltips, and popovers use independent backdrop layers and keyboard traps.' },
  ];
  accountDetails = [
    { label: 'Organization ID', value: 'org_84920491', badge: 'Verified' },
    { label: 'Primary Contact', value: 'sarah.j@acme.io' },
    { label: 'API Region', value: 'US East (N. Virginia)', badge: 'us-east-1' },
    { label: 'Billing Plan', value: 'Enterprise Tier', badge: 'Annual' },
    { label: 'Encrypted Storage', value: '4.8 TB of 10 TB' },
  ];

  // --- Group 6: Selection/Display Combinations ---
  selectedUserId: string | number = 'u1';
  usersList = [
    { id: 'u1', name: 'John Smith', role: 'Lead Architect', email: 'john.s@acme.io', online: true },
    { id: 'u2', name: 'Sarah Connor', role: 'DevOps Engineer', email: 'sarah.c@acme.io', online: true },
    { id: 'u3', name: 'Michael Chen', role: 'Security Director', email: 'm.chen@acme.io', online: false },
    { id: 'u4', name: 'Jessica Taylor', role: 'Product Lead', email: 'jess.t@acme.io', online: true },
  ];

  allChipOptions = [
    { id: 1, label: 'Finance' },
    { id: 2, label: 'Human Resources' },
    { id: 3, label: 'Engineering' },
    { id: 4, label: 'Product Design' },
    { id: 5, label: 'Legal & Compliance' },
  ];
  selectedChipItems = [
    { id: 1, label: 'Finance' },
    { id: 2, label: 'Human Resources' },
  ];

  selectedIconKey = '📊';

  cascadingData = [
    {
      id: 'us',
      name: 'United States',
      children: [
        {
          id: 'ca',
          name: 'California',
          children: [
            { id: 'sf', name: 'San Francisco' },
            { id: 'la', name: 'Los Angeles' },
          ]
        },
        {
          id: 'ny',
          name: 'New York',
          children: [
            { id: 'nyc', name: 'New York City' },
            { id: 'alb', name: 'Albany' },
          ]
        }
      ]
    },
    {
      id: 'in',
      name: 'India',
      children: [
        {
          id: 'ka',
          name: 'Karnataka',
          children: [
            { id: 'blr', name: 'Bengaluru' },
            { id: 'mys', name: 'Mysuru' },
          ]
        },
        {
          id: 'mh',
          name: 'Maharashtra',
          children: [
            { id: 'mum', name: 'Mumbai' },
            { id: 'pun', name: 'Pune' },
          ]
        }
      ]
    }
  ];
  selectedCountry = 'us';
  selectedState = 'ca';
  selectedCity = 'sf';

  // --- Group 7: Search and Filtering ---
  searchQueryStr = '';
  activeFilterChips = [
    { id: '1', field: 'Status', value: 'Active' },
    { id: '2', field: 'Department', value: 'Finance' },
  ];
  filterRules = [
    { id: 'r1', field: 'status', operator: 'equals', value: 'Active' },
    { id: 'r2', field: 'dept', operator: 'equals', value: 'Finance' },
  ];
  sortCols = [
    { label: 'Created Date', key: 'created_at' },
    { label: 'Customer Name', key: 'name' },
    { label: 'Contract Amount', key: 'amount' },
  ];
  selectedSortKey = 'created_at';
  sortDir: 'asc' | 'desc' = 'desc';
  quickFilterTab = 'active';
  quickFilterTabs = [
    { label: 'All Users', value: 'all', count: 124 },
    { label: 'Active', value: 'active', count: 96 },
    { label: 'Archived', value: 'archived', count: 28 },
  ];

  // --- Group 9: File/Document UI ---
  demoFileCard = { name: 'annual_audit_report_2026.pdf', size: '4.8 MB', progress: 84 };
  attachmentFiles = [
    { id: 1, name: 'architecture_specification_v2.pdf', size: '2.4 MB' },
    { id: 2, name: 'security_compliance_soc2.docx', size: '890 KB' },
    { id: 3, name: 'financial_ledger_q3.xlsx', size: '1.6 MB' },
  ];

  // --- Group 10: User/Entity Representations ---
  teamAvatars = [
    { name: 'Sarah Jenkins', status: 'online' as const },
    { name: 'Alex Morales', status: 'online' as const },
    { name: 'Michael Chen', status: 'busy' as const },
    { name: 'Jessica Taylor', status: 'away' as const },
    { name: 'David Kim' },
    { name: 'Emily Watson' },
    { name: 'Robert Vance' },
  ];


  // --- Table Action Toolbar State ---
  refreshCount = 0;
  isLocked = false;
  density: TableDensity = 'comfortable';
  lastExported = '';
  lastDownloaded = '';
  activeView = 'Default';
  isFullscreen = false;
  isCollapsed = false;
  isCollabActive = true;
  columnScrollIndex = 1;
  lastActionMessage = '';

  triggerOverlay(): void {
    this.isOverlayLoading = true;
    setTimeout(() => (this.isOverlayLoading = false), 1500);
  }

  onRefresh(): void {
    this.refreshCount++;
    this.lastActionMessage = `Refreshed (${this.refreshCount})`;
  }

  onLock(locked: boolean): void {
    this.isLocked = locked;
    this.lastActionMessage = locked ? 'Table locked for editing' : 'Table unlocked';
  }

  onDensityChange(d: TableDensity): void {
    this.density = d;
    this.lastActionMessage = `Density set to: ${d}`;
  }

  onExport(fmt: ExportFormat): void {
    this.lastExported = fmt;
    this.lastActionMessage = `Exported as ${fmt.toUpperCase()}`;
  }

  onDownload(fmt: DownloadFormat): void {
    this.lastDownloaded = fmt;
    this.lastActionMessage = `Downloaded as ${fmt.toUpperCase()}`;
  }

  onColumnsChange(visibility: Record<string, boolean>): void {
    const visibleCount = Object.values(visibility).filter(Boolean).length;
    this.lastActionMessage = `Columns updated: ${visibleCount} visible`;
  }

  onColumnNav(dir: 'prev' | 'next'): void {
    if (dir === 'prev' && this.columnScrollIndex > 1) this.columnScrollIndex--;
    if (dir === 'next' && this.columnScrollIndex < 5) this.columnScrollIndex++;
    this.lastActionMessage = `Scrolled columns to page ${this.columnScrollIndex}`;
  }

  onViewChange(view: string): void {
    this.activeView = view || 'Default';
    this.lastActionMessage = `Switched to view: ${this.activeView}`;
  }

  onSaveView(): void {
    this.lastActionMessage = 'Saved current view layout';
  }

  onResetView(): void {
    this.activeView = 'Default';
    this.lastActionMessage = 'Reset view to default';
  }

  onActionClick(actionName: string): void {
    this.lastActionMessage = `Triggered: ${actionName}`;
  }
}
