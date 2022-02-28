import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import { distinctUntilChanged } from 'rxjs/operators';

import { Config } from '../../config';
import { selectUser } from '../../user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from '../../user/selectors/company.selectors';

class SentryHttpError extends Error {

  constructor(error: HttpErrorResponse) {
    super(error.error ? JSON.stringify(error.error) : 'HTTP Error');
    this.name = `${error.status} ${error.url}`;
  }

}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  sentryInitialized = false;

  /**
   * Error Handler cannot have injected dependencies
   * they have to be asked for manually
   */
  constructor(public injector: Injector, public zone: NgZone) { }

  handleError(err: any): any {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(err.message)) {
      window.location.reload();
      return;
    }

    /**
     * If sentry is not initialized, check for sentryDSN
     * Init sentry only if sentryDSN is enabled
     */
    if (!this.sentryInitialized) {
      const config = this.injector.get(Config);

      if (config && config.sentry) {
        Sentry.init({
          ...config.sentry,
          integrations: [new Integrations.RewriteFrames()],
        });

        try {
          const store = this.injector.get(Store);
          // init user scope
          store
            .pipe(selectUser, distinctUntilChanged())
            .subscribe(u =>
              Sentry.setUser(u && { id: u.sgAccountId, email: u.email })
            );
          // init company context
          store
            .pipe(selectActiveOrNoCompany, distinctUntilChanged())
            .subscribe(c => Sentry.setContext(
              'company',
              c && { sgCompanyId: c.sgCompanyId, name: c.name }
            ));
        } catch (error) {
          console.log(error);
        }

        this.sentryInitialized = true;
      }
    }

    if (this.sentryInitialized) {
      const error = err.originalError || err;

      if (error instanceof HttpErrorResponse) {
        Sentry.captureException(new SentryHttpError(error));

      } else if (!(error instanceof Error)) {
        const message = JSON.stringify(error);
        // skip logging geocoder fails
        if (message && !message.match(/nominatim|yandex|opencagedata/)) {
          Sentry.captureMessage(message);
        }
      } else {
        Sentry.captureException(error);

        try {
          const snackBar = this.injector.get(MatSnackBar);
          const transloco = this.injector.get(TranslocoService);

          this.zone.run(() => {
            snackBar.open(
              transloco.translate('common.error.internal'),
              transloco.translate('common.action.reload'),
              { duration: 15000 }
            ).onAction().subscribe(() => {
              location.reload();
            });
          });
        } catch (er) {
          console.error(er);
        }
      }
      console.error(err);
      // optionally raise feedback dialog for user
      // Sentry.showReportDialog({ eventId }); - eventId returned from capture* method
    }

    throw err;
  }
}
