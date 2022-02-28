import { Route } from '@angular/router';

import { SideNavigationRoute } from 'ng-shared/shared/types';

import { EconomyComponent } from './containers/economy/economy.component';
import { LifetimePerformanceComponent } from './containers/lifetime-performance/lifetime-performance.component';
import { ProjectOverviewComponent } from './containers/overview/project-overview.component';
import { PerformanceLossesComponent } from './containers/performance-losses/performance-losses.component';
import { ProjectInfoComponent } from './containers/project-info/project-info.component';
import { PvConfigurationComponent } from './containers/pv-configuration/pv-configuration.component';
import { PvElectricityHourlyComponent } from './containers/pv-electricity-hourly/pv-electricity-hourly.component';
import { PvElectricityMonthlyComponent } from './containers/pv-electricity-monthly/pv-electricity-monthly.component';
import { SolarMeteoHourlyComponent } from './containers/solar-meteo-hourly/solar-meteo-hourly.component';
import { SolarMeteoMonthlyComponent } from './containers/solar-meteo-monthly/solar-meteo-monthly.component';

export interface CompareRouteWarningsConfig {
  noPvConfig?: boolean;
  noEconomyConfig?: boolean;
  noLatestData?: boolean;
}

export interface CompareRoute extends Route {
  data: SideNavigationRoute['data'] & {
    disabled?: boolean;
    warnings?: CompareRouteWarningsConfig;
  };
}

export const routes: CompareRoute[] = [
  {
    path: 'overview',
    component: ProjectOverviewComponent,
    pathMatch: 'full',
    data: {
      nav: {
        name: 'projectDetail.nav.overview',
        svgIcon: 'sg:sgf-overview',
        dividerAfter: true,
        textAfter: 'projectDetail.nav.properties'
      },
      warnings: { noPvConfig: true }
    }
  },

  {
    path: 'info',
    component: ProjectInfoComponent,
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
    },
  },
  {
    path: 'pv-electricity/monthly',
    component: PvElectricityMonthlyComponent,
    data: {
      parent: 'pv-electricity',
      nav: {
        name: 'projectDetail.nav.monthlyStatistics',
      },
      warnings: { noPvConfig: true }
    }
  },
  {
    path: 'pv-electricity/hourly',
    component: PvElectricityHourlyComponent,
    data: {
      parent: 'pv-electricity',
      nav: {
        name: 'projectDetail.nav.hourlyProfiles',
      },
      warnings: { noPvConfig: true }
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
        svgIcon: 'sg:sgf-pv-performance'
      },
      access: 'prospect:pvcalc:paid',
    },
  },
  {
    path: 'pv-performance/losses',
    component: PerformanceLossesComponent,
    data: {
      parent: 'pv-performance',
      nav: {
        name: 'projectDetail.nav.pvLosses',
      },
      warnings: { noPvConfig: true }
    }
  },
  {
    path: 'pv-performance/lifetime',
    component: LifetimePerformanceComponent,
    data: {
      parent: 'pv-performance',
      nav: {
        name: 'projectDetail.nav.lifetimePerformance',
      },
      warnings: { noPvConfig: true }
    }
  },

  {
    path: 'finance',
    pathMatch: 'full',
    component: EconomyComponent,
    data: {
      nav: {
        name: 'projectDetail.nav.finance',
        svgIcon: 'sg:sgf-economy',
        dividerAfter: true
      },
      access: 'prospect:economy',
      warnings: { noPvConfig: true, noEconomyConfig: true }
    },
  },
];
