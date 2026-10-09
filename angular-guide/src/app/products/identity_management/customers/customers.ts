import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterTableComponent } from '../../../pages/employees/employee-table.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MasterTableComponent,
  ],
  templateUrl: './customers.html',
})
export class Customer {
  title = 'Customer';
  user_table_key = 'customers_table_1234';
  table_identifier = 'customers_instance_1';
}
