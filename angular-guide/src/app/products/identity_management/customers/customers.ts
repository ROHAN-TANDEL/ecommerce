import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MasterTableComponent } from '../../../pages/employees/employee-table.component';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [
        CommonModule,
        MasterTableComponent
    ],
    templateUrl: './customers.html',
})
export class Customer implements OnInit {
    private readonly http = inject(HttpClient);
    private readonly cdr = inject(ChangeDetectorRef);

    title = 'Customer';
    user_table_key = 'customers_table_1234';
    table_identifier = 'customers_instance_1';
    tableConfig: any = null;
    isLoading = true;

    ngOnInit(): void {
        this.userTableConfig();
    }

    userTableConfig(): void {
        const configApi = 'http://localhost:3000/identity/management/customers/config/table';
        this.isLoading = true;

        this.http.get<any>(configApi).subscribe({
            next: (res) => {
                // Unpack payload whether returned directly or nested in `data`
                const configData = res?.data || res;
                this.tableConfig = configData;

                // Sync table key & title from the backend configuration
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