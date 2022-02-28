import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CompanySnapshot } from '@solargis/types/user-company';

@Component({
  selector: 'sg-admin-order-company-summary',
  templateUrl: './order-company-summary.component.html',
  styleUrls: ['./order-company-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCompanySummaryComponent {
  @Input() companySnapshot: CompanySnapshot;

  getStateName(): string {
    const state = this.companySnapshot.state;
    return typeof state === 'string' ? state : state?.name;
  }
}
