import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-kanban-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div class="flex items-center justify-between mb-2">
        <span
          [class]="tagColorClasses"
          class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
        >
          {{ tag }}
        </span>

        @if (priority) {
          <span
            [class]="priorityColorClasses"
            class="text-[10px] font-bold uppercase tracking-wider"
          >
            {{ priority }}
          </span>
        }
      </div>

      <h5 class="text-xs font-semibold text-slate-800 line-clamp-2 mb-2 leading-relaxed">
        {{ title }}
      </h5>

      @if (description) {
        <p class="text-[11px] text-slate-500 line-clamp-2 mb-3">
          {{ description }}
        </p>
      }

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <div class="flex items-center gap-1.5">
          @if (dueDate) {
            <span class="inline-flex items-center gap-1">
              📅 {{ dueDate }}
            </span>
          }
        </div>

        @if (assigneeName) {
          <div
            class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]"
            [title]="assigneeName"
          >
            {{ assigneeInitials }}
          </div>
        }
      </div>
    </div>
  `
})
export class NexoraKanbanCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() tag = 'Task';
  @Input() tagVariant: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' = 'blue';
  @Input() priority?: 'low' | 'medium' | 'high' | 'urgent';
  @Input() dueDate = '';
  @Input() assigneeName = '';

  get assigneeInitials(): string {
    if (!this.assigneeName) return '';
    return this.assigneeName
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get tagColorClasses(): string {
    const map = {
      blue: 'bg-blue-50 text-blue-700 border border-blue-100',
      purple: 'bg-purple-50 text-purple-700 border border-purple-100',
      amber: 'bg-amber-50 text-amber-700 border border-amber-100',
      emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      rose: 'bg-rose-50 text-rose-700 border border-rose-100'
    };
    return map[this.tagVariant] || map.blue;
  }

  get priorityColorClasses(): string {
    switch (this.priority) {
      case 'urgent':
        return 'text-rose-600 font-bold';
      case 'high':
        return 'text-amber-600';
      case 'medium':
        return 'text-blue-600';
      case 'low':
      default:
        return 'text-slate-400';
    }
  }
}

@Component({
  selector: 'nexora-kanban-column',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col bg-slate-50/80 border border-slate-200 rounded-xl p-3 w-72 shrink-0 max-h-[600px]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" [class]="statusDotClasses"></span>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">{{ title }}</h4>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
            {{ count }}
          </span>
        </div>

        <button
          type="button"
          (click)="addCard.emit()"
          class="text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 p-1 rounded transition-colors text-sm font-bold"
          title="Add task to column"
        >
          +
        </button>
      </div>

      <!-- Card container -->
      <div class="flex flex-col gap-2.5 overflow-y-auto flex-1 min-h-[100px] pr-1">
        <ng-content />
      </div>
    </div>
  `
})
export class NexoraKanbanColumnComponent {
  @Input() title = 'Backlog';
  @Input() count = 0;
  @Input() statusVariant: 'slate' | 'blue' | 'amber' | 'emerald' = 'slate';
  @Output() addCard = new EventEmitter<void>();

  get statusDotClasses(): string {
    switch (this.statusVariant) {
      case 'blue': return 'bg-blue-500';
      case 'amber': return 'bg-amber-500';
      case 'emerald': return 'bg-emerald-500';
      case 'slate':
      default: return 'bg-slate-400';
    }
  }
}
