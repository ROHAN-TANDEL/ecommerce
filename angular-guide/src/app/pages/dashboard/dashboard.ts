import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {

  user = {
    id: 'usr_123456',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    tenant: 'acme',
    role: 'Admin',
    status: 'Active'
  };

}
