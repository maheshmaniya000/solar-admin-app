import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

import { appMenuApps, AppMenuApp, getAppByUrl } from './app-menu.apps';


@Component({
  selector: 'sg-app-menu',
  styleUrls: ['./app-menu.component.scss'],
  templateUrl: './app-menu.component.html'
})
export class AppMenuComponent implements OnChanges {
  dropdownApps: any[];

  @Input() currentApp: string;
  @Input() isCompanyAdmin: boolean;
  @Input() isSolargisAdmin: boolean;

  constructor(private readonly router: Router) {}

  redirect(event: any, app: AppMenuApp): void {
    event.preventDefault();
    const currentApp = getAppByUrl(window.location.pathname);

    if (currentApp.app === app.app) {
      const appSegments = app.link.split('/').filter(Boolean);
      appSegments.shift();
      this.router.navigate(['/', ...appSegments]);
    } else {
      window.location.href = app.link;
    }
  }

  ngOnChanges(): void {
    if (!this.isSolargisAdmin) {
      this.dropdownApps = appMenuApps.filter(item => item.name !== 'admin');
    } else {
      this.dropdownApps = appMenuApps;
    }
  }
}
