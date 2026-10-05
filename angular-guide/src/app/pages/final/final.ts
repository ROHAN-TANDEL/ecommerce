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
  ],
  templateUrl: './final.html',
  styleUrl: './final.css'
})
export class Final {
  activeTab: 'inputs' | 'actions' = 'inputs';

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
