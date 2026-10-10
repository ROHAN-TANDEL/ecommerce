import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-header-component',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
  template: `
    <thead class="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
      <ng-content></ng-content>
    </thead>
  `,
})
export class TableHeaderComponent {}
