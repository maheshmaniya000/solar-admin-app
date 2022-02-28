import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, first, switchMap, tap } from 'rxjs/operators';

import { APIContractFull } from '@solargis/types/api/contract';
import { Company } from '@solargis/types/user-company';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { State } from 'ng-shared/user/reducers';
import { selectActiveCompany } from 'ng-shared/user/selectors/company.selectors';

import { ApiContractsService } from '../../services/api-contracts.service';

@Component({
  selector: 'sg-api-contract-detail',
  templateUrl: './api-contract-detail.component.html',
  styleUrls: ['./api-contract-detail.component.scss']
})
export class ApiContractDetailComponent extends SubscriptionAutoCloseComponent implements OnInit {

  company: Company;
  apiContract: APIContractFull;

  revokingToken = -1;
  generatingNewToken = false;

  isMonitor = false;
  isMonitorSetToHardLimit = false;
  monitorRelativeWindow: number;
  monitorRelativeType: 'y' | 'm' | 'd' = null;

  summarizationString;
  processingKeysString;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly apiContractsService: ApiContractsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      combineLatest(
        this.store.pipe(selectActiveCompany),
        this.route.params
      ).pipe(
        tap(([company]) => this.company = company),
        switchMap(([company, params]) => this.apiContractsService.getAPIContracts(company.sgCompanyId, params.id )),
      ).subscribe(
        apiContract => {
          this.apiContract = apiContract;
          this.isMonitor = this.apiContract.dataDeliveryContract && !!this.apiContract.dataDeliveryContract.historic;
          this.summarizationString = apiContract.dataDeliveryContract.summarization.join(', ');
          this.processingKeysString = apiContract.dataDeliveryContract.processingKeys.join(', ');
          if (this.isMonitor) {
            this.isMonitorSetToHardLimit = this.apiContract.dataDeliveryContract.historic &&
              typeof this.apiContract.dataDeliveryContract.historic === 'number';
            if (typeof this.apiContract.dataDeliveryContract.historic === 'string') {
              const historic: string = this.apiContract.dataDeliveryContract.historic as string;
              this.monitorRelativeWindow = parseInt(historic.substr(0, historic.length - 1), 10);
              this.monitorRelativeType = historic[historic.length - 1] as 'y' | 'm' | 'd';
            }
          }
        }, err => {
          console.error(err);
        }
      )
    );
  }

  /**
   * Generate new access key (token) for existing API Contract
   */
  addNewTokenToAPIContract(): void {
    this.generatingNewToken = true;
    this.apiContractsService.generateNewToken(this.company.sgCompanyId, this.apiContract.id).subscribe(newToken => {
        this.generatingNewToken = false;
        this.apiContract.accessTokensCount += 1;
        this.apiContract.accessTokens.push(newToken);
      },
      err => {
        console.error(err);
        this.generatingNewToken = false;
        this.snackBar.open(
          translate('companyAdmin.api.common.token.errorCreating'),
          null,
          { duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter'] }
        );
      });
  }

  /**
   * Revoke existing API contract with confirming window.
   */
  revokeTokenForAPIContract(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'companyAdmin.api.common.token.revokeConfirmHeader',
        text: 'companyAdmin.api.common.token.revokeConfirmMessage'
      }
    });

    dialogRef.afterClosed()
      .pipe(
        first(),
        filter(result => !!result),
        switchMap(() => {
          this.revokingToken = index;
          return this.apiContractsService.revokeToken(this.company.sgCompanyId, this.apiContract.id, this.apiContract.accessTokens[index]);
        })
      )
      .subscribe(
        () => {
          this.revokingToken = -1;
          this.apiContract.accessTokens.splice(index, 1);
        },
        err => {
          console.error(err);
          this.revokingToken = -1;
          this.snackBar.open(
            translate('companyAdmin.api.common.token.revokeError'),
            null,
            { duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter'] }
          );
        });
  }
}
