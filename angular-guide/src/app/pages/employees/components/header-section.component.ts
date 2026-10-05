import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'header-section-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-2xs">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-base font-semibold text-slate-900 tracking-tight">
            {{ displayName }}
          </h1>

          <span *ngIf="tableKey" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {{ tableKey }}
          </span>

          <!-- API Connection Status Badge -->
          <span
            *ngIf="apiStatus"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border"
            [ngClass]="{
              'bg-emerald-50 text-emerald-700 border-emerald-200': apiStatus === 'connected',
              'bg-amber-50 text-amber-700 border-amber-200': apiStatus === 'connecting',
              'bg-slate-100 text-slate-600 border-slate-200': apiStatus === 'offline-mock'
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              [ngClass]="{
                'bg-emerald-500 animate-pulse': apiStatus === 'connected',
                'bg-amber-500 animate-spin': apiStatus === 'connecting',
                'bg-slate-400': apiStatus === 'offline-mock'
              }"
            ></span>
            <span>
              {{ apiStatus === 'connected' ? 'Live API Connected (:3000)' : apiStatus === 'connecting' ? 'Connecting...' : 'Offline Fallback Active' }}
            </span>
          </span>
        </div>

        <p *ngIf="description" class="text-xs text-slate-500 mt-0.5">
          {{ description }}
        </p>
      </div>

      <!-- Action buttons projected slot -->
      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </header>
  `,
})
export class HeaderSectionComponent {
  @Input() displayName = '';
  @Input() tableKey = '';
  @Input() apiStatus: 'connected' | 'offline-mock' | 'connecting' | null = null;
  @Input() description = '';
}
