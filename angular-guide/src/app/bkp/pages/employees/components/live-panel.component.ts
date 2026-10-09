import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveTableEvent, TableUserPresence } from '../employees.types';

@Component({
  selector: 'live-panel-component',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="border border-slate-200/90 bg-white rounded-xl shadow-xs overflow-hidden animate-slide-up transition-all duration-200">

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 1. LIVE PANEL HEADER BAR                                        -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <!-- Radar Pulse -->
          <div class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>

          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
              <span>Live Panel Feed</span>
              <span class="text-[10px] font-normal text-slate-400">({{ instanceLabel }})</span>
            </h3>

            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Sync Active
            </span>

            <span class="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <span>📡 /listen/users</span>
              <span class="text-slate-300">|</span>
              <span>🎙️ /talk/users</span>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Filter Tabs -->
          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
            <button
              type="button"
              (click)="activeFilter = 'all'"
              [class.bg-white]="activeFilter === 'all'"
              [class.text-slate-900]="activeFilter === 'all'"
              [class.shadow-2xs]="activeFilter === 'all'"
              [class.text-slate-500]="activeFilter !== 'all'"
              class="rounded-md px-2.5 py-1 transition-all cursor-pointer"
            >
              All ({{ events.length }})
            </button>
            <button
              type="button"
              (click)="activeFilter = 'data'"
              [class.bg-white]="activeFilter === 'data'"
              [class.text-amber-800]="activeFilter === 'data'"
              [class.shadow-2xs]="activeFilter === 'data'"
              [class.text-slate-500]="activeFilter !== 'data'"
              class="rounded-md px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Data Impact ({{ dataImpactingCount }})</span>
            </button>
            <button
              type="button"
              (click)="activeFilter = 'ui'"
              [class.bg-white]="activeFilter === 'ui'"
              [class.text-slate-900]="activeFilter === 'ui'"
              [class.shadow-2xs]="activeFilter === 'ui'"
              [class.text-slate-500]="activeFilter !== 'ui'"
              class="rounded-md px-2.5 py-1 transition-all cursor-pointer"
            >
              UI & Views ({{ uiEventsCount }})
            </button>
          </div>

          <!-- Clear events button -->
          <button
            type="button"
            (click)="clearEvents.emit()"
            [disabled]="events.length === 0"
            class="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear Event Log"
          >
            Clear Log
          </button>

          <!-- Close / minimize -->
          <button
            type="button"
            (click)="closePanel.emit()"
            class="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            title="Hide Live Panel"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 2. ACTIVE USER PRESENCE CARDS                                   -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/60 flex flex-wrap items-center gap-3">
        <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Active Users on {{ tableKey }}:</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Fallback user cards if presences empty -->
          <ng-container *ngIf="activePresences.length > 0; else fallbackPresences">
            <div
              *ngFor="let p of activePresences"
              class="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs"
              [class.ring-1]="p.instanceId === instanceId"
              [class.ring-blue-400]="p.instanceId === instanceId"
            >
              <span
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                [ngClass]="p.instanceId === 'table-1' ? 'bg-blue-600' : 'bg-emerald-600'"
              >
                {{ p.instanceId === 'table-1' ? 'U1' : 'U2' }}
              </span>
              <div class="leading-tight">
                <span class="font-bold text-slate-800">{{ p.userName }}</span>
                <span *ngIf="p.instanceId === instanceId" class="text-[10px] text-blue-600 font-semibold ml-1">(You)</span>
                <span class="text-slate-300 mx-1">•</span>
                <span class="text-slate-500 font-normal text-[11px]">{{ p.currentActivity }}</span>
              </div>
            </div>
          </ng-container>

          <ng-template #fallbackPresences>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs ring-1 ring-blue-400">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">U1</span>
              <span class="font-bold text-slate-800">User 1 (Table 1)</span>
              <span class="text-slate-300">•</span>
              <span class="text-slate-500 text-[11px]">Active Session</span>
            </div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">U2</span>
              <span class="font-bold text-slate-800">User 2 (Table 2)</span>
              <span class="text-slate-300">•</span>
              <span class="text-slate-500 text-[11px]">Collaborative Peer</span>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 3. LIVE ACTIVITY STREAM / EVENT LOG                             -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 bg-white p-2 space-y-1">

        <!-- Empty state when no events in stream -->
        <div *ngIf="filteredEvents.length === 0" class="py-6 px-4 text-center">
          <div class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mb-2">
            <span class="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-50"></span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="text-xs font-semibold text-slate-700">Live Channel Listening...</div>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Any actions performed on Table 1 or Table 2 (viewing, filtering, editing, deleting, collapsing) will stream live here.
          </p>
        </div>

        <!-- Event Rows -->
        <div
          *ngFor="let item of filteredEvents"
          class="flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-slate-50/80 transition-colors animate-slide-up text-xs"
          [class.bg-amber-50/40]="item.isDataImpacting"
        >
          <div class="flex items-start gap-2.5 min-w-0 flex-1">
            <!-- Action Type Icon / Badge -->
            <span
              class="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight uppercase"
              [ngClass]="getBadgeClass(item.actionType, item.isDataImpacting)"
            >
              {{ item.actionType }}
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- User Chip -->
                <span
                  class="inline-flex items-center gap-1 font-semibold text-[11px]"
                  [class.text-blue-700]="item.sourceInstanceId === 'table-1'"
                  [class.text-emerald-700]="item.sourceInstanceId === 'table-2'"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    [class.bg-blue-600]="item.sourceInstanceId === 'table-1'"
                    [class.bg-emerald-600]="item.sourceInstanceId === 'table-2'"
                  ></span>
                  <span>{{ item.sourceUser }}</span>
                </span>

                <span class="font-bold text-slate-900">{{ item.title }}</span>

                <span
                  *ngIf="item.isDataImpacting"
                  class="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider"
                >
                  Impacts Backend Data
                </span>
              </div>

              <!-- Detail text -->
              <div class="text-[11px] text-slate-600 mt-0.5 break-words">
                {{ item.detail }}
              </div>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="shrink-0 text-right text-[10px] font-mono text-slate-400 pt-0.5">
            {{ item.timestamp | date:'shortTime' }}
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- 4. BOTTOM STATUS BAR                                            -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Broadcast channel: <strong class="text-slate-700">{{ tableKey }}</strong></span>
        </div>
        <div>
          <span>{{ events.length }} event(s) recorded in session</span>
        </div>
      </div>

    </div>
  `,
})
export class LivePanelComponent {
  @Input() tableKey = 'users_table_1234';
  @Input() instanceId = 'table-1';
  @Input() instanceLabel = 'Table 1';
  @Input() events: LiveTableEvent[] = [];
  @Input() activePresences: TableUserPresence[] = [];

  @Output() closePanel = new EventEmitter<void>();
  @Output() clearEvents = new EventEmitter<void>();

  activeFilter: 'all' | 'data' | 'ui' = 'all';

  get dataImpactingCount(): number {
    return this.events.filter(e => e.isDataImpacting).length;
  }

  get uiEventsCount(): number {
    return this.events.filter(e => !e.isDataImpacting).length;
  }

  get filteredEvents(): LiveTableEvent[] {
    if (this.activeFilter === 'data') {
      return this.events.filter(e => e.isDataImpacting);
    }
    if (this.activeFilter === 'ui') {
      return this.events.filter(e => !e.isDataImpacting);
    }
    return this.events;
  }

  getBadgeClass(type: string, isDataImpacting: boolean): string {
    switch (type) {
      case 'DELETE':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'EDIT':
      case 'SAVE':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'FILTER':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'SELECT':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'SORT':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'COLLAPSE':
        return 'bg-slate-200 text-slate-800 border border-slate-300';
      case 'DENSITY':
      case 'COLUMN':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'VIEW_PRESET':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }
}
