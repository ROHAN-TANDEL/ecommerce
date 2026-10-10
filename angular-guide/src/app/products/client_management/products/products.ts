import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MasterTableComponent } from '../../../bkp/pages/employees/employee-table.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MasterTableComponent,
  ],
  templateUrl: './products.html',
})
export class Product implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  title = 'Product Management';
  user_table_key = 'products_table_5003';
  table_identifier = 'products_instance';
  product = 'client_management';
  basePath = '/client/management/products';
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
        console.warn('[Product] Could not fetch table config from API, using defaults', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
