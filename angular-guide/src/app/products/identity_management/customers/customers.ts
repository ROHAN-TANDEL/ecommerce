import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MasterTableComponent } from '../../../bkp/pages/employees/employee-table.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MasterTableComponent,
  ],
  templateUrl: './customers.html',
})
export class Customer implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  title = 'Customer Management';
  user_table_key = 'customers_table_1234';
  table_identifier = 'customers_instance';
  product = 'identity_management';
  basePath = '/identity/management/customers';
  tableConfig: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.fetchTableConfig();
  }

  fetchTableConfig(): void {
    const configApi = `http://localhost:3000${this.basePath}/config/table`;
    this.isLoading = true;

    this.http.get<any>(configApi).subscribe({
      next: (res) => {
        const configData = res?.data || res;
        this.tableConfig = configData;

        if (configData?.table_key) {
          this.user_table_key = configData.table_key;
        }
        if (configData?.display_name) {
          this.title = configData.display_name;
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('[Customer] Could not fetch table config from API, using fallback defaults', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}