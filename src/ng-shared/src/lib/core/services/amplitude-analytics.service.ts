import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { AmplitudeClient } from 'amplitude-js';
import amplitude from 'amplitude-js/amplitude';
import { distinctUntilChanged } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';
import { BulkAssignUserTagOpts, EnergySystem, Project, UserTag } from '@solargis/types/project';
import { PvConfig } from '@solargis/types/pv-config';
import { Company } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';

import { Config } from '../../config';
import { State } from '../reducers';

/** This type is used to type check and unify sent params object to amplitude */
export type AmplitudeEventData = {
  actionName?: string;
  mapLayer?: string;
  pvConfig?: PvConfig;
  energySystem?: Partial<EnergySystem>;
  projectIds?: string[];
  projectId?: string;
  compare?: {
    addedCount?: number;
    removedCount?: number;
  };
  userTag?: {
    addedProjects?: string[];
    tags?: UserTag[];
  };
  userTagsChange?: BulkAssignUserTagOpts;
  report?: {
    type?: string;
    lang?: string;
  };
  page?: string;
  company?: Partial<Company>;
  order?: Partial<Order>;
  project?: Partial<Project>;
  count?: number;
  price?: number;
  items?: string[];
  latlng?: any;
  freeTrial?: {
    product?: string;
    validity?: string;
  };
  url?: string;
  language?: string;
};


export type AmplitudeEventCode =
  'application_load' |

  'map_click' |
  'map_tool_use' |
  'map_layer_change' |

  'tag_create' |
  'tag_assigned_project' |

  'project_saved' |
  'project_updated' |
  'project_deleted' |
  'project_archived' |
  'project_unarchived' |
  'project_transfer' |
  'project_renamed' |
  'project_export' |

  'company_select' |
  'company_create' |
  'company_update' |
  'company_invite' |

  'pv_config_save' |

  'compare_edit' |
  'compare_open' |

  'report_create' |
  'report_download' |

  'detail_page_open' |

  'sign_up_started' |
  'sign_up_form_completed' |
  'sign_up_completed' |

  'order_created_from_cart' |
  'order_paid_braintree' |

  'login_succesful' |
  'login_error' |

  'password_change_request' |
  'password_changed' |

  'free_trial_activated' |
  'free_trial_claimed' |

  'user_edit';


let amplitudeClient: AmplitudeClient;

@Injectable({ providedIn: 'root' })
export class AmplitudeAnalyticsService extends SubscriptionAutoCloseComponent {

  selectedCompany: Company;

  constructor(
    private readonly config: Config,
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
  ) {
    super();
  }

  initTracking(): void {
    if (!amplitudeClient && !!this.config.amplitude) {
      amplitudeClient = amplitude.getInstance();
      amplitudeClient.init(this.config.amplitude.key, null, {
        apiEndpoint: 'api2.amplitude.com',
        includeGclid: true,
        includeReferrer: true,
        includeUtm: true,
      });

      // Do not add first() here
      // We need to track also when the user loggs in
      this.addSubscription(
        this.store.pipe(selectUser, distinctUntilChanged()).subscribe(
          user => {
            if (user) {
              amplitudeClient.setUserId(user.sgAccountId);
            } else {
              amplitudeClient.setUserId(null);
            }
          }
        )
      );

      this.addSubscription(
        this.store.pipe(selectActiveOrNoCompany).subscribe(c => this.selectedCompany = c)
      );

      this.trackEvent('application_load');
    }
  }

  trackEvent(event: AmplitudeEventCode, data: AmplitudeEventData = {}, sendEnvData = true): void {
    // avoid side effects - make a copy just in case
    data = { ...data };

    try {
      if (sendEnvData) {
        if (this.selectedCompany) {
          data.company = {
            sgCompanyId: this.selectedCompany.sgCompanyId,
          };
        }
        data.language = this.transloco.getActiveLang();
      }

      if (amplitudeClient) {
        amplitudeClient.logEvent(event, data);
      }
    } catch (err) {
      console.error(err);
    }
  }

}

