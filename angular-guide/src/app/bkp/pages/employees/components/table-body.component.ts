import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-body-component',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
  template: `
    <tbody class="divide-y divide-slate-100 text-xs">
      <ng-content></ng-content>
    </tbody>
  `,
})
export class TableBodyComponent {}
