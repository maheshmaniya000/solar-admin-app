import { Component } from '@angular/core';

import { prospectPricingUrl } from 'ng-shared/shared/utils/url.utils';

@Component({
  selector: 'sg-compare-no-permissions',
  templateUrl: './compare-no-permissions.component.html',
  styleUrls: ['./compare-no-permissions.component.scss']
})
export class CompareNoPermissionsComponent {
  prospectPricingUrl = prospectPricingUrl;
}
