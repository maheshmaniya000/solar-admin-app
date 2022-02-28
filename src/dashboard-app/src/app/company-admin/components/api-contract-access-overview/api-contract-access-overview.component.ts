import { Component, Input } from '@angular/core';

@Component({
  selector: 'sg-api-contract-access-overview',
  templateUrl: './api-contract-access-overview.component.html',
  styleUrls: ['./api-contract-access-overview.component.scss']
})
export class ApiContractAccessOverviewComponent {

  @Input()
  access;

}
