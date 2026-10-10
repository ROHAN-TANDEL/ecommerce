import { Component, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeTableComponent } from './employee-table.component';

export { EmployeeTableComponent };

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeTableComponent,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {
  @ViewChildren(EmployeeTableComponent) tables!: QueryList<EmployeeTableComponent>;

  get table1(): EmployeeTableComponent | undefined {
    return this.tables?.first;
  }

  get table2(): EmployeeTableComponent | undefined {
    return this.tables?.last;
  }
}
