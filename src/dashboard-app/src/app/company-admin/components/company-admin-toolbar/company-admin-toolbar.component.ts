import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SideNavigationRoute } from 'ng-shared/shared/types';

@Component({
  selector: 'sg-company-admin-toolbar',
  templateUrl: './company-admin-toolbar.component.html',
  styleUrls: ['./company-admin-toolbar.component.scss']
})
export class CompanyAdminToolbarComponent {

  @Input() route: SideNavigationRoute;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  back(): void {
    this.router.navigate([this.route.data.parent], { relativeTo: this.activatedRoute });
  }

}
