import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr[nexora-master-table-row-detail]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <td colspan="100%" class="p-0 border-b border-[#EAECF0] bg-[#F9FAFB]/90">
      <div class="px-12 py-5 space-y-4">
        <!-- Sub-header & Navigation -->
        <div class="flex items-center justify-between border-b border-[#EAECF0] pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#101828]">
              Account Inspector: {{ accountName }}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-[#D0D5DD] text-[#344054]">
              {{ accountId }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <button
              type="button"
              (click)="activeTab = 'overview'"
              [class]="activeTab === 'overview' ? 'text-[#436CF3] font-bold border-b-2 border-[#436CF3]' : 'text-[#667085] hover:text-[#101828]'"
              class="pb-1 px-1 transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              (click)="activeTab = 'timeline'"
              [class]="activeTab === 'timeline' ? 'text-[#436CF3] font-bold border-b-2 border-[#436CF3]' : 'text-[#667085] hover:text-[#101828]'"
              class="pb-1 px-1 transition-colors cursor-pointer"
            >
              Activity Trail
            </button>
            <button
              type="button"
              (click)="activeTab = 'notes'"
              [class]="activeTab === 'notes' ? 'text-[#436CF3] font-bold border-b-2 border-[#436CF3]' : 'text-[#667085] hover:text-[#101828]'"
              class="pb-1 px-1 transition-colors cursor-pointer"
            >
              Internal Notes
            </button>
          </div>
        </div>

        <!-- Tab 1: Overview -->
        @if (activeTab === 'overview') {
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div class="p-3 bg-white rounded-xl border border-[#EAECF0] space-y-1">
              <span class="text-[10px] uppercase font-bold text-[#667085]">Contract Term</span>
              <div class="text-[#101828] font-semibold">Annual Recurring (Net 30)</div>
              <div class="text-[11px] text-[#027A48]">Renews in 4 months</div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-[#EAECF0] space-y-1">
              <span class="text-[10px] uppercase font-bold text-[#667085]">Dedicated Support Rep</span>
              <div class="text-[#101828] font-semibold">{{ dedicatedRep || 'Sarah Connor (Senior TAM)' }}</div>
              <div class="text-[11px] text-[#667085]">SLA Response: &lt; 15 mins</div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-[#EAECF0] space-y-1">
              <span class="text-[10px] uppercase font-bold text-[#667085]">API Usage Quota</span>
              <div class="text-[#101828] font-semibold">1,482,900 / 2,000,000 calls</div>
              <div class="w-full bg-[#EAECF0] h-1.5 rounded-full overflow-hidden mt-1">
                <div class="bg-[#436CF3] h-full w-[74%] rounded-full"></div>
              </div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-[#EAECF0] space-y-1">
              <span class="text-[10px] uppercase font-bold text-[#667085]">Security Compliance</span>
              <div class="text-[#101828] font-semibold">SOC2 Type II &amp; GDPR</div>
              <div class="text-[11px] text-[#027A48]">✓ Verified Audit Passed</div>
            </div>
          </div>
        }

        <!-- Tab 2: Activity Trail -->
        @if (activeTab === 'timeline') {
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2 text-[#344054]">
              <span class="w-2 h-2 rounded-full bg-[#12B76A]"></span>
              <span class="font-mono text-[#667085]">Today 14:32</span>
              <span>Payment cleared for invoice #INV-2026-9042 via Stripe</span>
            </div>
            <div class="flex items-center gap-2 text-[#344054]">
              <span class="w-2 h-2 rounded-full bg-[#436CF3]"></span>
              <span class="font-mono text-[#667085]">Yesterday 09:15</span>
              <span>Updated regional headquarters address to Mumbai Tech Park</span>
            </div>
          </div>
        }

        <!-- Tab 3: Notes -->
        @if (activeTab === 'notes') {
          <div class="p-3 bg-white rounded-xl border border-[#EAECF0] text-xs text-[#475467]">
            Client requested upgrade to Enterprise Cluster with multi-region failover before Q4 Black Friday sale.
          </div>
        }
      </div>
    </td>
  `
})
export class MasterTableRowDetailComponent {
  @Input() accountName = '';
  @Input() accountId = '';
  @Input() dedicatedRep = '';

  activeTab: 'overview' | 'timeline' | 'notes' = 'overview';
}
