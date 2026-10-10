import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NexoraCalendarComponent,
  NexoraMiniCalendarComponent,
  NexoraEventCardComponent,
  NexoraAgendaSlotComponent,
  NexoraEventIndicatorComponent,
  NexoraTimestampComponent,
  NexoraRelativeDateComponent,
  NexoraContainerComponent,
  NexoraSectionLayoutComponent,
  NexoraPanelComponent,
  NexoraStackComponent,
  NexoraToolbarLayoutComponent,
  NexoraActionBarComponent,
  NexoraDividerComponent,
  NexoraSpacerComponent,
  NexoraSplitPaneComponent,
  NexoraHeadingComponent,
  NexoraCaptionComponent,
  NexoraInfoIndicatorComponent,
  NexoraMetadataRowComponent,
  NexoraEmptyStateComponent,
  NexoraNoResultsComponent,
  NexoraNoPermissionComponent,
  NexoraNotFoundComponent,
  NexoraErrorStateComponent,
  NexoraOfflineStateComponent,
  NexoraLoadingStateComponent,
  NexoraDragHandleComponent,
  NexoraSortableItemComponent,
  NexoraReorderableColumnComponent,
  NexoraKanbanCardComponent,
  NexoraKanbanColumnComponent,
  NexoraViewerCountComponent,
  NexoraEditingIndicatorComponent,
  NexoraTypingIndicatorComponent,
  NexoraRowLockIndicatorComponent,
  NexoraSyncStatusComponent,
  ViewerUser,
  NexoraCurrencyDisplayComponent,
  NexoraPercentageDisplayComponent,
  NexoraMaskedValueComponent,
  NexoraReferenceNumberComponent,
  NexoraApprovalStatusComponent,
  NexoraRiskIndicatorComponent,
  NexoraComplianceBadgeComponent,
  NexoraPermissionMatrixComponent,
  PermissionRow
} from '../../../../components/nexora-starter';

export interface KanbanCardItem {
  id: string;
  title: string;
  tag: string;
  tagVariant: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignee: string;
}

@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NexoraCalendarComponent,
    NexoraMiniCalendarComponent,
    NexoraEventCardComponent,
    NexoraAgendaSlotComponent,
    NexoraEventIndicatorComponent,
    NexoraTimestampComponent,
    NexoraRelativeDateComponent,
    NexoraContainerComponent,
    NexoraSectionLayoutComponent,
    NexoraPanelComponent,
    NexoraStackComponent,
    NexoraToolbarLayoutComponent,
    NexoraActionBarComponent,
    NexoraDividerComponent,
    NexoraSpacerComponent,
    NexoraSplitPaneComponent,
    NexoraHeadingComponent,
    NexoraCaptionComponent,
    NexoraInfoIndicatorComponent,
    NexoraMetadataRowComponent,
    NexoraEmptyStateComponent,
    NexoraNoResultsComponent,
    NexoraNoPermissionComponent,
    NexoraNotFoundComponent,
    NexoraErrorStateComponent,
    NexoraOfflineStateComponent,
    NexoraLoadingStateComponent,
    NexoraDragHandleComponent,
    NexoraSortableItemComponent,
    NexoraReorderableColumnComponent,
    NexoraKanbanCardComponent,
    NexoraKanbanColumnComponent,
    NexoraViewerCountComponent,
    NexoraEditingIndicatorComponent,
    NexoraTypingIndicatorComponent,
    NexoraRowLockIndicatorComponent,
    NexoraSyncStatusComponent,
    NexoraCurrencyDisplayComponent,
    NexoraPercentageDisplayComponent,
    NexoraMaskedValueComponent,
    NexoraReferenceNumberComponent,
    NexoraApprovalStatusComponent,
    NexoraRiskIndicatorComponent,
    NexoraComplianceBadgeComponent,
    NexoraPermissionMatrixComponent
  ],
  templateUrl: './starter.html',
  styleUrl: './starter.css',
})
export class Starter {
  // Navigation tabs
  activeTab: 'scheduling' | 'layout' | 'typography' | 'states' | 'dragdrop' | 'collab' | 'business' = 'scheduling';

  // Last event feedback log
  lastActionMessage = 'Interactive starter component workspace loaded.';

  // 11. Scheduling state
  selectedCalendarDate = new Date();
  sampleDates = {
    now: new Date(),
    tenMinAgo: new Date(Date.now() - 10 * 60 * 1000),
    threeHoursAgo: new Date(Date.now() - 3 * 3600 * 1000),
    yesterday: new Date(Date.now() - 86400 * 1000),
    fourDaysAgo: new Date(Date.now() - 4 * 86400 * 1000),
    nextMonth: new Date(Date.now() + 30 * 86400 * 1000)
  };

  // 15. States sample
  simulatedSearchQuery = 'quarterly-audit-tax-report-2026';
  showLoadingSimulator = false;

  // 16. Drag-and-drop sortable items
  sortableItems = [
    { id: 1, title: 'Primary customer verification', subtitle: 'Compliance check via AML gateway' },
    { id: 2, title: 'Risk assessment calculation', subtitle: 'Automated weighted scoring' },
    { id: 3, title: 'Manager approval signoff', subtitle: 'Requires Level 2 clearance' },
    { id: 4, title: 'Ledger disbursement webhook', subtitle: 'Dispatches payload to Swift network' }
  ];

  reorderableColumns = [
    { key: 'id', label: 'Transaction ID', visible: true },
    { key: 'customer', label: 'Customer Account', visible: true },
    { key: 'amount', label: 'Net Amount', visible: true },
    { key: 'status', label: 'Approval Status', visible: true },
    { key: 'risk', label: 'Risk Factor', visible: true },
    { key: 'actions', label: 'Table Actions', visible: false }
  ];


  kanbanCards: Record<'todo' | 'inProgress' | 'done', KanbanCardItem[]> = {
    todo: [
      { id: 't1', title: 'Implement biometric KYC verification step', tag: 'Security', tagVariant: 'purple', priority: 'urgent', dueDate: 'Tomorrow', assignee: 'Alex Morgan' },
      { id: 't2', title: 'Audit AWS KMS cryptographic key rotation', tag: 'DevOps', tagVariant: 'blue', priority: 'medium', dueDate: 'Oct 12', assignee: 'Devin Chen' }
    ],
    inProgress: [
      { id: 't3', title: 'Design high-volume ledger pagination', tag: 'Frontend', tagVariant: 'emerald', priority: 'high', dueDate: 'Oct 08', assignee: 'Sarah Taylor' },
      { id: 't4', title: 'Integrate Stripe webhook retry backoff', tag: 'Backend', tagVariant: 'amber', priority: 'high', dueDate: 'Oct 09', assignee: 'Rohan Tandel' }
    ],
    done: [
      { id: 't5', title: 'Publish Nexora Starter design system v2.0', tag: 'Release', tagVariant: 'emerald', priority: 'low', dueDate: 'Done', assignee: 'Design System' }
    ]
  };

  // 17. Collaboration state
  activeViewers: ViewerUser[] = [
    { id: 'u1', name: 'Jo Patterson', initials: 'JO', color: 'bg-indigo-600' },
    { id: 'u2', name: 'Alex Lee', initials: 'AL', color: 'bg-emerald-600' },
    { id: 'u3', name: 'Taylor Scott', initials: 'TA', color: 'bg-amber-600' },
    { id: 'u4', name: 'Morgan Vance', initials: 'MV', color: 'bg-purple-600' },
    { id: 'u5', name: 'Chris Jordan', initials: 'CJ', color: 'bg-pink-600' },
    { id: 'u6', name: 'Sam Rivera', initials: 'SR', color: 'bg-cyan-600' }
  ];

  rowIsLocked = true;
  syncStatus: 'synced' | 'saving' | 'offline' | 'error' = 'synced';

  // 18. Business UI state
  activeCurrency: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR';
  sampleAmount = 125000.75;
  approvalStatusVal: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT' | 'CHANGES_REQUESTED' = 'APPROVED';
  riskLevelVal: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH';

  permissionMatrixData: PermissionRow[] = [
    { role: 'Viewer (Read-only)', read: true, write: false, delete: false, admin: false },
    { role: 'Analyst (Auditor)', read: true, write: false, delete: false, admin: false },
    { role: 'Editor (Operator)', read: true, write: true, delete: false, admin: false },
    { role: 'Compliance Officer', read: true, write: true, delete: true, admin: false },
    { role: 'Super Admin', read: true, write: true, delete: true, admin: true }
  ];

  logAction(msg: string) {
    this.lastActionMessage = `[${new Date().toLocaleTimeString()}] ${msg}`;
  }

  onDateSelect(date: Date) {
    this.selectedCalendarDate = date;
    this.logAction(`Selected calendar date: ${date.toDateString()}`);
  }

  moveItem(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index > 0) {
      const item = this.sortableItems.splice(index, 1)[0];
      this.sortableItems.splice(index - 1, 0, item);
      this.logAction(`Moved "${item.title}" up to position ${index}`);
    } else if (direction === 'down' && index < this.sortableItems.length - 1) {
      const item = this.sortableItems.splice(index, 1)[0];
      this.sortableItems.splice(index + 1, 0, item);
      this.logAction(`Moved "${item.title}" down to position ${index + 2}`);
    }
  }

  addKanbanItem(column: 'todo' | 'inProgress' | 'done') {
    const newId = `t-${Date.now()}`;
    this.kanbanCards[column].push({
      id: newId,
      title: `New task item #${this.kanbanCards[column].length + 1}`,
      tag: 'Task',
      tagVariant: 'blue',
      priority: 'medium',
      dueDate: 'Flexible',
      assignee: 'Current User'
    });
    this.logAction(`Added new task card to ${column.toUpperCase()} column`);
  }

  toggleRowLock() {
    this.rowIsLocked = !this.rowIsLocked;
    this.logAction(`Row lock toggled: ${this.rowIsLocked ? 'Locked' : 'Unlocked'}`);
  }

  cycleSync() {
    const states: ('synced' | 'saving' | 'offline' | 'error')[] = ['synced', 'saving', 'offline', 'error'];
    const nextIdx = (states.indexOf(this.syncStatus) + 1) % states.length;
    this.syncStatus = states[nextIdx];
    this.logAction(`Sync status changed to "${this.syncStatus}"`);
  }
}
