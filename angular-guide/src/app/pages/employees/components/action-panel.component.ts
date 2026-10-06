import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionActionGroup, EnrichedColumn } from '../employees.types';
import { DropdownSectionsComponent } from './dropdown-sections.component';

@Component({
  selector: 'action-panel-component',
  standalone: true,
  imports: [CommonModule, DropdownSectionsComponent],
  template: `
    <div class="relative z-30 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs overflow-visible">

      <!-- Left: Pinned Toolbar Actions Slot (Driven dynamically by config pinned: true) -->
      <div class="flex items-center flex-wrap gap-1.5 overflow-visible">
        <ng-content></ng-content>
      </div>

      <!-- Right: Config-driven Dropdown Section Components (Actions, Views, More) -->
      <div class="flex items-center flex-wrap gap-2 overflow-visible" *ngIf="sectionGroups && sectionGroups.length > 0">
        <dropdown-sections-component
          *ngFor="let section of sectionGroups"
          [section]="section"
          [isIndividualSelected]="isIndividualSelected"
          [isMasterChecked]="isMasterChecked"
          [hasDirtyRows]="hasDirtyRows"
          [columns]="columns"
          [scrollPercentage]="scrollPercentage"
          [isScrollable]="isScrollable"
          (toggleColumn)="toggleColumn.emit($event)"
          (reorderColumn)="reorderColumn.emit($event)"
          (resetColumns)="resetColumns.emit()"
          (scrollTable)="scrollTable.emit($event)"
          (actionSelect)="actionSelect.emit($event)"
        ></dropdown-sections-component>
      </div>

    </div>
  `,
})
export class ActionPanelComponent {
  @Input() sectionGroups: SectionActionGroup[] = [];
  @Input() isIndividualSelected = false;
  @Input() isMasterChecked = false;
  @Input() hasDirtyRows = false;
  @Input() columns: EnrichedColumn[] = [];
  @Input() scrollPercentage = 0;
  @Input() isScrollable = false;

  @Output() actionSelect = new EventEmitter<{ actionKey: string; optionKey?: string }>();
  @Output() toggleColumn = new EventEmitter<string>();
  @Output() reorderColumn = new EventEmitter<{ colKey: string; direction: 'up' | 'down' }>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() scrollTable = new EventEmitter<'left' | 'right' | 'start' | 'end'>();
}
