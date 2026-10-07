import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionActionGroup, EnrichedColumn, SavedTableView } from '../employees.types';
import { DropdownSectionsComponent } from './dropdown-sections.component';

@Component({
  selector: 'action-panel-component',
  standalone: true,
  imports: [CommonModule, DropdownSectionsComponent],
  template: `
    <div class="relative z-40 flex flex-wrap items-center gap-1.5 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs overflow-visible">

      <!-- Pinned Toolbar Actions Slot -->
      <ng-content></ng-content>

      <!-- Pinned Dropdown Section Components (Actions, Views, More, Exports) aligned with other pinned items as last -->
      <ng-container *ngFor="let section of pinnedSectionGroups">
        <dropdown-sections-component
          [section]="section"
          [isIndividualSelected]="isIndividualSelected"
          [isMasterChecked]="isMasterChecked"
          [hasDirtyRows]="hasDirtyRows"
          [columns]="columns"
          [scrollPercentage]="scrollPercentage"
          [isScrollable]="isScrollable"
          [density]="density"
          [savedViews]="savedViews"
          [activeView]="activeView"
          [isLoadingViews]="isLoadingViews"
          (toggleColumn)="toggleColumn.emit($event)"
          (reorderColumn)="reorderColumn.emit($event)"
          (resetColumns)="resetColumns.emit()"
          (scrollTable)="scrollTable.emit($event)"
          (actionSelect)="actionSelect.emit($event)"
        ></dropdown-sections-component>
      </ng-container>

      <!-- Unpinned Sections (if any) placed on the right -->
      <div class="ml-auto flex items-center flex-wrap gap-1.5 overflow-visible" *ngIf="unpinnedSectionGroups.length > 0">
        <dropdown-sections-component
          *ngFor="let section of unpinnedSectionGroups"
          [section]="section"
          [isIndividualSelected]="isIndividualSelected"
          [isMasterChecked]="isMasterChecked"
          [hasDirtyRows]="hasDirtyRows"
          [columns]="columns"
          [scrollPercentage]="scrollPercentage"
          [isScrollable]="isScrollable"
          [density]="density"
          [savedViews]="savedViews"
          [activeView]="activeView"
          [isLoadingViews]="isLoadingViews"
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
  @Input() density?: string;
  @Input() savedViews: SavedTableView[] = [];
  @Input() activeView?: string | number;
  @Input() isLoadingViews = false;

  @Output() actionSelect = new EventEmitter<{ actionKey: string; optionKey?: string }>();
  @Output() toggleColumn = new EventEmitter<string>();
  @Output() reorderColumn = new EventEmitter<{ colKey: string; direction: 'up' | 'down' }>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() scrollTable = new EventEmitter<'left' | 'right' | 'start' | 'end'>();

  get pinnedSectionGroups(): SectionActionGroup[] {
    return (this.sectionGroups || []).filter(
      s => (s.pinned === true || String(s.pinned) === 'true') && s.actions && s.actions.length > 0
    );
  }

  get unpinnedSectionGroups(): SectionActionGroup[] {
    return (this.sectionGroups || []).filter(
      s => s.pinned !== true && String(s.pinned) !== 'true' && s.actions && s.actions.length > 0
    );
  }
}
