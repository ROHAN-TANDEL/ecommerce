import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionActionGroup, EnrichedColumn, SavedTableView } from '../employees.types';
import { DropdownSectionsComponent } from './dropdown-sections.component';

@Component({
  selector: 'action-panel-component',
  standalone: true,
  imports: [CommonModule, DropdownSectionsComponent],
  styles: [':host { display: block; position: relative; z-index: 30; }'],
  template: `
    <div class="relative z-30 flex flex-wrap items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-visible">

      <!-- Unpinned Sections (Actions, Views, More, Exports) placed on the left -->
      <div class="flex items-center flex-wrap gap-1.5 overflow-visible" *ngIf="unpinnedSectionGroups.length > 0">
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
          (togglePinAction)="togglePinAction.emit($event)"
        ></dropdown-sections-component>
      </div>

      <!-- Pinned Items Container right-aligned (ml-auto): aligned from right to left -->
      <div class="ml-auto flex items-center flex-wrap gap-1.5 justify-end overflow-visible">
        <!-- Pinned Dropdown Section Components -->
        <dropdown-sections-component
          *ngFor="let section of pinnedSectionGroups"
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
          (togglePinAction)="togglePinAction.emit($event)"
        ></dropdown-sections-component>

        <!-- Pinned Toolbar Actions Slot -->
        <ng-content></ng-content>
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
  @Output() togglePinAction = new EventEmitter<string>();
  @Output() toggleColumn = new EventEmitter<string>();
  @Output() reorderColumn = new EventEmitter<{ colKey: string; direction: 'up' | 'down' }>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() scrollTable = new EventEmitter<'left' | 'right' | 'start' | 'end'>();

  get pinnedSectionGroups(): SectionActionGroup[] {
    return (this.sectionGroups || []).filter(
      s => (s.pinned === true || String(s.pinned) === 'true') &&
        s.actions &&
        s.actions.some(a => a.pinned !== true && String(a.pinned) !== 'true')
    );
  }

  get unpinnedSectionGroups(): SectionActionGroup[] {
    return (this.sectionGroups || []).filter(
      s => s.pinned !== true && String(s.pinned) !== 'true' &&
        s.actions &&
        s.actions.some(a => a.pinned !== true && String(a.pinned) !== 'true')
    );
  }
}
