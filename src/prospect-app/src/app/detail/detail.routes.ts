import { Route } from '@angular/router';

import { SideNavigationRoute } from 'ng-shared/shared/types';

import { DownloadDataComponent } from './containers/download-data/download-data.component';
import { EconomyCalculatorResultsComponent } from './containers/economy-calculator-results/economy-calculator-results.component';
import { EconomyCalculatorComponent } from './containers/economy-calculator/economy-calculator.component';
import { ProspectMetadataComponent } from './containers/metadata/prospect-metadata.component';
import { ProjectInfoViewComponent } from './containers/project-info-view/project-info-view.component';
import { ProspectOverviewComponent } from './containers/prospect-overview/prospect-overview.component';
import { PvConfigurationComponent } from './containers/pv-configuration/pv-configuration.component';
import { PvElectricityHourlyComponent } from './containers/pv-electricity-hourly/pv-electricity-hourly.component';
import { PvElectricityMonthlyComponent } from './containers/pv-electricity-monthly/pv-electricity-monthly.component';
import { PvLifetimePerformanceComponent } from './containers/pv-lifetime-performance/pv-lifetime-performance.component';
import { PvPerformanceLossesComponent } from './containers/pv-performance-losses/pv-performance-losses.component';
import { ReportsComponent } from './containers/reports/reports.component';
import { SolarMeteoHourlyComponent } from './containers/solar-meteo-hourly/solar-meteo-hourly.component';
import { SolarMeteoMonthlyComponent } from './containers/solar-meteo-monthly/solar-meteo-monthly.component';
import { EconomyUnsavedChangesGuard } from './guards/economy.guard';


export interface DetailRoute extends Route {
  data: SideNavigationRoute['data'] & {
    requiresPvConfig?: boolean;
  };
}

export const routes: DetailRoute[] = [
  {
    path: 'overview',
    component: ProspectOverviewComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.overview',
        svgIcon: 'sg:sgf-overview',
        dividerAfter: true,
        textAfter: 'projectDetail.nav.properties'
      }
    }
  },

  {
    path: 'info',
    component: ProjectInfoViewComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.projectInfo',
        svgIcon: 'sg:sgf-site-info',
      }
    }
  },

  {
    path: 'pv-configuration',
    component: PvConfigurationComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.pvConfig',
        svgIcon: 'sg:sgf-pv-configuration',
        dividerAfter: true,
        textAfter: 'projectDetail.nav.analysis'
      }
    }
  },

  {
    path: 'solar-meteo',
    pathMatch: 'full',
    redirectTo: 'solar-meteo/monthly',
    data: {
      empty: true,
      nav: {
        name: 'projectDetail.nav.solarMeteo',
        svgIcon: 'sg:sgf-solar-meteo',
      },
      access: 'prospect:lta:paid'
    },
  },
  {
    path: 'solar-meteo/monthly',
    component: SolarMeteoMonthlyComponent,
    data: {
      parent: 'solar-meteo',
      nav: {
        name: 'projectDetail.nav.monthlyStatistics',
      }
    }
  },
  {
    path: 'solar-meteo/hourly',
    component: SolarMeteoHourlyComponent,
    data: {
      parent: 'solar-meteo',
      nav: {
        name: 'projectDetail.nav.hourlyProfiles',
      }
    }
  },

  {
    path: 'pv-electricity',
    pathMatch: 'full',
    redirectTo: 'pv-electricity/monthly',
    data: {
      empty: true,
      nav: {
        name: 'projectDetail.nav.pvElectricity',
        svgIcon: 'sg:sgf-pv-electricity',
      },
      access: 'prospect:pvcalc:paid',
      requiresPvConfig: true
    },
  },
  {
    path: 'pv-electricity/monthly',
    component: PvElectricityMonthlyComponent,
    data: {
      parent: 'pv-electricity',
      nav: {
        name: 'projectDetail.nav.monthlyStatistics',
      }
    }
  },
  {
    path: 'pv-electricity/hourly',
    component: PvElectricityHourlyComponent,
    data: {
      parent: 'pv-electricity',
      nav: {
        name: 'projectDetail.nav.hourlyProfiles',
      }
    }
  },

  {
    path: 'pv-performance',
    pathMatch: 'full',
    redirectTo: 'pv-performance/losses',
    data: {
      empty: true,
      nav: {
        name: 'projectDetail.nav.pvPerformance',
        svgIcon: 'sg:sgf-pv-performance',
      },
      access: 'prospect:pvcalc:paid',
      requiresPvConfig: true
    },
  },
  {
    path: 'pv-performance/losses',
    component: PvPerformanceLossesComponent,
    data: {
      parent: 'pv-performance',
      nav: {
        name: 'projectDetail.nav.pvLosses',
      }
    }
  },
  {
    path: 'pv-performance/lifetime',
    component: PvLifetimePerformanceComponent,
    data: {
      parent: 'pv-performance',
      nav: {
        name: 'projectDetail.nav.lifetimePerformance',
      }
    }
  },

  {
    path: 'finance',
    pathMatch: 'full',
    component: EconomyCalculatorComponent,
    canDeactivate: [
      EconomyUnsavedChangesGuard
    ],
    data: {
      nav: {
        name: 'projectDetail.nav.finance',
        svgIcon: 'sg:sgf-economy',
        dividerAfter: true,
        textAfter: 'projectDetail.nav.download'
      },
      access: 'prospect:economy',
      requiresPvConfig: true
    },
  },
  {
    path: 'finance/results',
    component: EconomyCalculatorResultsComponent,
    data: {
      fullscreen: true,
      access: 'prospect:economy',
    }
  },

  {
    path: 'reports',
    component: ReportsComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.reports',
        svgIcon: 'sg:sgf-download-data'
      },
      access: 'prospect:report',
      // access: 'admin:all'
    }
  },

  {
    path: 'download-data',
    component: DownloadDataComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.data',
        svgIcon: 'sg:sgf-reports',
        dividerAfter: true,
        textAfter: 'projectDetail.nav.support'
      },
      access: 'prospect:report',
    }
  },

  {
    path: 'metadata',
    component: ProspectMetadataComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.metadata',
        icon: 'layers',
        dividerAfter: true,
      },
      // access: 'admin:all'
    }
  },
];
