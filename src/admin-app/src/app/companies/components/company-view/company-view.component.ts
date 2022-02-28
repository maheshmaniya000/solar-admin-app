import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

import { Company } from '@solargis/types/user-company';

import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { CompanyViewStore } from './company-view.store';

@Component({
  selector: 'sg-admin-company-view',
  styleUrls: ['./company-view.component.scss'],
  templateUrl: './company-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CompanyViewStore]
})
export class CompanyViewComponent implements OnChanges {
  @Input() company: Company;

  constructor(readonly companyViewStore: CompanyViewStore, readonly detailNavigationService: DetailNavigationService) {}

  ngOnChanges(): void {
    this.companyViewStore.setCompany(this.company);
  }
}
