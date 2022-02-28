import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

import { APIContract, APIContractFull } from '@solargis/types/api/contract';
import { Company } from '@solargis/types/user-company';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { AdminApiContractsService } from '../../../shared/services/admin-api-contracts.service';
import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../../store';
import { CompaniesSelectors } from '../../store';

/**
 * Component controlling/saving/updating api contracts.
 */
@Component({
  selector: 'sg-admin-api-contract-container',
  templateUrl: './admin.api-contract-container.component.html',
  styleUrls: [ './admin.api-contract-container.component.scss' ]
})
export class AdminApiContractContainerComponent extends SubscriptionAutoCloseComponent implements OnInit {

  company: Company = null;

  newApiContract: APIContractFull = null;
  newApiContractValid = false;

  loadingContracts = false;
  deletingContractId: string = null;
  revokingToken = -1;
  savingNewContract = false;
  loadingExistingContract = false;
  generatingNewToken = false;

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly route: ActivatedRoute,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly adminApiContractsService: AdminApiContractsService,
    private readonly dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    const storeCompany$ = this.store.select(CompaniesSelectors.selectSelected).pipe(first());
    const params$ = this.route.paramMap.pipe(first());
    combineLatest(storeCompany$, params$).subscribe((data: any) => {
      const apiContractCompany = data[0] as Company;
      const params = data[1];
      if (apiContractCompany) {
        this.company = { ...apiContractCompany };
        this.loadContract();
      } else {
        if (params && params.params && params.params.sgCompanyId) {
          this.adminUsersCompaniesService
            .getCompany(params.params.sgCompanyId)
            .subscribe(company => {
              if (company) {
                this.company = company;
                this.loadContract();
              } else {
                this.snackBar.open('Such company does not exists', null, {
                  duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
                });
                this.onCloseClick();
              }
            });
        } else {
          this.onCloseClick();
        }
      }
    });
  }

  /**
   * Add new (not existing, clean) API contract
   */
  addNewAPIContract(): void {
    this.newApiContract = {
      maxRequests: [
        {
          count: 10,
          perSeconds: 60
        }
      ]
    } as APIContractFull;
    this.newApiContractValid = false;
  }

  /**
   * Save new API contract
   */
  saveNewAPIContract(): void {
    this.savingNewContract = true;
    this.adminApiContractsService.upsertAPIContract(this.company.sgCompanyId, this.newApiContract).subscribe(
      () => {
        this.savingNewContract = false;
        this.snackBar.open('API Contract has been saved', null, {
          duration: 3000, panelClass: ['snackbarPass', 'snackbarTextCenter']
        });
        this.loadContract();
        this.cancelNewAPIContract();
      },
      err => {
        console.error(err);
        this.savingNewContract = false;
        this.snackBar.open('API Contract could not be saved', null, {
          duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
        });
      });
  }

  /**
   * Set existing API contract for editing
   *
   * @param contract
   */
  editAPIContract(contract: APIContract): void {
    this.cancelNewAPIContract();
    this.loadingExistingContract = true;
    this.adminApiContractsService.getAPIContracts(this.company.sgCompanyId, contract.id).subscribe(loadedContract => {
      this.loadingExistingContract = false;
      this.newApiContractValid = true; // when editing existing (from db) api contract, expecting it is valid
      this.newApiContract = loadedContract as APIContractFull;
    },
      err => {
        console.error(err);
        this.loadingExistingContract = false;
        this.snackBar.open('API Contract could not be loaded', null, {
          duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
        });
      });
  }

  /**
   * Cancel editing of API contract (existing or new one)
   */
  cancelNewAPIContract(): void {
    this.newApiContract = null;
  }

  /**
   * Delete API contract with confirming window
   */
  deleteAPIContract(contract: APIContract): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'API Contract deletion',
        text: 'Do you really want to delete API Contract ?'
      }
    });

    dialogRef.afterClosed()
      .pipe(
        first(),
        filter(result => !!result),
        switchMap(() => {
          this.deletingContractId = contract.id;
          return this.adminApiContractsService.deleteAPIContracts(this.company.sgCompanyId, contract.id);
        }),
      )
      .subscribe(
        () => {
          this.snackBar.open('API Contract has been deleted', null, {
            duration: 3000, panelClass: ['snackbarPass', 'snackbarTextCenter']
          });
          this.deletingContractId = null;
          this.loadContract();
        },
        err => {
          console.error(err);
          this.deletingContractId = null;
          this.snackBar.open('API Contract could not be deleted', null, {
            duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
          });
        });
  }

  /**
   * Generate new access key (token) for existing API Contract
   */
  addNewTokenToAPIContract(): void {
    this.generatingNewToken = true;
    this.adminApiContractsService.generateNewToken(this.company.sgCompanyId, this.newApiContract.id).subscribe(newToken => {
        this.generatingNewToken = false;
        this.newApiContract.accessTokens.push(newToken);
        this.newApiContract.accessTokensCount = this.newApiContract.accessTokens.length;
      },
      err => {
        console.error(err);
        this.generatingNewToken = false;
        this.snackBar.open('Cannot generate new token (access key)', null, {
          duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
        });
      });
  }

  /**
   * Revoke existing API contract with confirming window.
   */
  revokeTokenForAPIContract(token: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'Access key (token) revoke',
        text: 'Do you really want to revoke access key (token) for API Contract ?'
      }
    });

    let index;
    dialogRef.afterClosed()
      .pipe(
        first(),
        filter(result => !!result),
        switchMap(() => {
          index = this.newApiContract.accessTokens.indexOf(token);
          this.revokingToken = index;
          return this.adminApiContractsService.revokeToken(
            this.company.sgCompanyId,
            this.newApiContract.id,
            this.newApiContract.accessTokens[index]);
        })
      )
      .subscribe(
        () => {
          this.revokingToken = -1;
          this.newApiContract.accessTokens.splice(index, 1);
        },
        err => {
          console.error(err);
          this.revokingToken = -1;
          this.snackBar.open('Access key (token) could not be revoked', null, {
            duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
          });
        });
  }

  /**
   * Reload API contract for company
   */
  loadContract(): void {
    this.company.apiContracts = [];
    this.loadingContracts = true;
    this.adminApiContractsService.listAPIContracts(this.company.sgCompanyId).subscribe(
      apiContracts =>  {
        this.loadingContracts = false;
        this.company.apiContracts = apiContracts;
      },
      err => {
        console.error(err);
        this.snackBar.open('API Contracts could not be loaded', null, {
          duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter']
        });
        this.loadingContracts = false;
      });
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route});
  }
}
