import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionActionGroup, ActionItemConfig } from '../employees.types';
import { DropdownSectionsComponent } from './dropdown-sections.component';

@Component({
  selector: 'action-panel-component',
  standalone: true,
  imports: [CommonModule, DropdownSectionsComponent],
  template: `
    <div class="relative z-30 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs overflow-visible">

      <!-- Left: Pinned Toolbar Actions Slot (Driven dynamically by config pinned: true) -->
      <div class="flex items-center flex-wrap gap-1.5 overflow-visible">
        <ng-content select="[pinned], refresh-component, save-component, edit-component, lock-component, density-component, live-component, button-component"></ng-content>
      </div>

      <!-- Right: Config-driven Dropdown Section Components (Actions, Views, More) -->
      <div class="flex items-center flex-wrap gap-2 overflow-visible" *ngIf="sectionGroups && sectionGroups.length > 0">
        <dropdown-sections-component
          *ngFor="let section of sectionGroups"
          [section]="section"
          (actionSelect)="actionSelect.emit($event)"
        ></dropdown-sections-component>
      </div>

    </div>
  `,
})
export class ActionPanelComponent {
  @Input() sectionGroups: SectionActionGroup[] = [];
  @Output() actionSelect = new EventEmitter<{ actionKey: string; optionKey?: string }>();
}
