import { Component, Input } from '@angular/core';

import { Company } from '@solargis/types/user-company';

@Component({
  selector: 'sg-admin-company-info',
  styleUrls: ['./company-info.component.scss'],
  templateUrl: './company-info.component.html'
})
export class CompanyInfoComponent {
  @Input() company: Company;
}
