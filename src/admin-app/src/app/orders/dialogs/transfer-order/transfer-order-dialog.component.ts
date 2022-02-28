import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { EMPTY } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';
import { Company } from '@solargis/types/user-company';

import { AdminOrdersService } from '../../../shared/services/admin-orders.service';
import { AdminActions, fromAdmin } from '../../../store';

export interface TransferOrderDialogData {
  sgOrderId: string;
}

@Component({
  templateUrl: './transfer-order-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./transfer-order-dialog.component.scss']
})
export class TransferOrderDialogComponent {
  selectedCompany: Company;
  updating = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: TransferOrderDialogData,
    private readonly dialogRef: MatDialogRef<TransferOrderDialogComponent, Order>,
    private readonly adminOrdersService: AdminOrdersService,
    private readonly store: Store<fromAdmin.State>
  ) {}

  isTransferButtonDisabled(): boolean {
    return this.updating || isNil(this.selectedCompany);
  }

  onCompanySelected(company: Company): void {
    this.selectedCompany = company;
  }

  onCloseButtonClick(): void {
    this.dialogRef.close();
  }

  onTransferButtonClick(): void {
    this.updating = true;
    this.adminOrdersService
      .transferOrder(this.data.sgOrderId, { sgCompanyId: this.selectedCompany.sgCompanyId })
      .pipe(
        tap({
          next: updatedOrder => {
            this.store.dispatch(
              AdminActions.showSnackbar({
                message: `Order has been transferred.`,
                styleClass: 'snackbarPass'
              })
            );
            this.dialogRef.close(updatedOrder);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
            this.store.dispatch(
              AdminActions.showSnackbar({
                message: `Couldn't transfer order to another company.`,
                styleClass: 'snackbarError'
              })
            );
          }
        }),
        catchError(() => EMPTY),
        finalize(() => (this.updating = false))
      )
      .subscribe();
  }
}
