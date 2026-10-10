import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-approval-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5">
      <span
        [class]="badgeClasses"
        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
      >
        <span class="w-1.5 h-1.5 rounded-full" [class]="dotClasses"></span>
        {{ status }}
      </span>

      @if (stepCount && totalSteps) {
        <span class="text-[11px] font-medium text-slate-500">
          ({{ stepCount }} of {{ totalSteps }})
        </span>
      }
    </div>
  `
})
export class NexoraApprovalStatusComponent {
  @Input() status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT' | 'CHANGES_REQUESTED' = 'APPROVED';
  @Input() stepCount?: number;
  @Input() totalSteps?: number;

  get badgeClasses(): string {
    switch (this.status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'CHANGES_REQUESTED':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'DRAFT':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  get dotClasses(): string {
    switch (this.status) {
      case 'APPROVED': return 'bg-emerald-500';
      case 'PENDING': return 'bg-blue-500';
      case 'REJECTED': return 'bg-rose-500';
      case 'CHANGES_REQUESTED': return 'bg-amber-500';
      case 'DRAFT':
      default: return 'bg-slate-400';
    }
  }
}

@Component({
  selector: 'nexora-risk-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5">
      <span
        [class]="riskClasses"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
      >
        @if (level === 'CRITICAL' || level === 'HIGH') {
          <span>⚠️</span>
        } @else if (level === 'MEDIUM') {
          <span>⚡</span>
        } @else {
          <span>🛡️</span>
        }
        {{ level }} RISK
      </span>

      @if (score !== undefined) {
        <span class="text-xs font-mono font-medium text-slate-500">
          Score: {{ score }}/100
        </span>
      }
    </div>
  `
})
export class NexoraRiskIndicatorComponent {
  @Input() level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  @Input() score?: number;

  get riskClasses(): string {
    switch (this.level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  }
}

@Component({
  selector: 'nexora-compliance-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5">
      @if (framework) {
        <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
          {{ framework }}
        </span>
      }

      <span
        [class]="statusClasses"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      >
        <span>{{ statusIcon }}</span>
        <span>{{ status }}</span>
      </span>
    </div>
  `
})
export class NexoraComplianceBadgeComponent {
  @Input() framework = 'SOC2 Type II';
  @Input() status: 'Compliant' | 'Non-Compliant' | 'In Review' | 'Exempt' = 'Compliant';

  get statusIcon(): string {
    switch (this.status) {
      case 'Compliant': return '✓';
      case 'Non-Compliant': return '✗';
      case 'In Review': return '⏳';
      case 'Exempt': return '○';
    }
  }

  get statusClasses(): string {
    switch (this.status) {
      case 'Compliant':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Non-Compliant':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Exempt':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }
}

export interface PermissionRow {
  role: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}

@Component({
  selector: 'nexora-permission-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto border border-slate-200 rounded-lg">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
          <tr>
            <th class="px-3.5 py-2">Role</th>
            <th class="px-3 py-2 text-center">Read</th>
            <th class="px-3 py-2 text-center">Write</th>
            <th class="px-3 py-2 text-center">Delete</th>
            <th class="px-3 py-2 text-center">Admin</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (row of rows; track row.role) {
            <tr class="hover:bg-slate-50/50">
              <td class="px-3.5 py-2 font-medium text-slate-800">{{ row.role }}</td>
              <td class="px-3 py-2 text-center">
                <span [class]="row.read ? 'text-emerald-600 font-bold' : 'text-slate-300'">
                  {{ row.read ? '✓' : '—' }}
                </span>
              </td>
              <td class="px-3 py-2 text-center">
                <span [class]="row.write ? 'text-emerald-600 font-bold' : 'text-slate-300'">
                  {{ row.write ? '✓' : '—' }}
                </span>
              </td>
              <td class="px-3 py-2 text-center">
                <span [class]="row.delete ? 'text-emerald-600 font-bold' : 'text-slate-300'">
                  {{ row.delete ? '✓' : '—' }}
                </span>
              </td>
              <td class="px-3 py-2 text-center">
                <span [class]="row.admin ? 'text-emerald-600 font-bold' : 'text-slate-300'">
                  {{ row.admin ? '✓' : '—' }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class NexoraPermissionMatrixComponent {
  @Input() rows: PermissionRow[] = [
    { role: 'Viewer', read: true, write: false, delete: false, admin: false },
    { role: 'Editor', read: true, write: true, delete: false, admin: false },
    { role: 'Manager', read: true, write: true, delete: true, admin: false },
    { role: 'Owner', read: true, write: true, delete: true, admin: true }
  ];
}
