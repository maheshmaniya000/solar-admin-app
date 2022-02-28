import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Company, User } from '@solargis/types/user-company';

import { AddCompanyDialogComponent } from 'ng-shared/user-shared/components/add-company-dialog/add-company-dialog.component';

@Component({
  selector: 'sg-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  @Input() user: User;
  @Input() company: Company;
  @Input() isCompanyAdmin: boolean;

  constructor(private readonly dialog: MatDialog) {}

  addNewCompany(): void {
    this.dialog.open(AddCompanyDialogComponent);
  }

}
