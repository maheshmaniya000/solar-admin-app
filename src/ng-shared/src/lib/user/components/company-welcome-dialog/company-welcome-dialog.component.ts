import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Company } from '@solargis/types/user-company';

export type CompanyWelcomeDialogOptions = {
  isNewCompany: boolean;
};

@Component({
  selector: 'sg-company-welcome-dialog',
  templateUrl: './company-welcome-dialog.component.html',
  styleUrls: ['./company-welcome-dialog.component.scss']
})
export class CompanyWelcomeDialogComponent {

  company: Company;
  isNewCompany: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<CompanyWelcomeDialogComponent>,
  ) {
    this.company = this.data.company;
    const options: CompanyWelcomeDialogOptions = this.data.options;
    this.isNewCompany = options ? options.isNewCompany : true;
  }

  close(): void {
    this.dialogRef.close({});
  }

}
