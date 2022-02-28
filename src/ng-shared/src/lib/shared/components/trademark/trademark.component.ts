import { Component } from '@angular/core';

import { Config } from 'ng-shared/config';

@Component({
  selector: 'sg-trademark',
  template: `<span>© {{ year }} Solargis v {{ config.version }}</span>`,
  styleUrls: ['./trademark.component.scss']
})
export class TrademarkComponent {
  year = new Date().getFullYear();

  constructor(readonly config: Config) {}
}
