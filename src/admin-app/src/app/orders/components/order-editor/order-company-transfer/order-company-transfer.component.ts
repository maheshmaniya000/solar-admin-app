import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { isNil } from 'lodash-es';
import { filter } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';

import { TransferOrderDialogComponent, TransferOrderDialogData } from '../../../dialogs/transfer-order/transfer-order-dialog.component';
import { OrderDetailStore } from '../../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-company-transfer',
  templateUrl: './order-company-transfer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCompanyTransferComponent {
  @Input() sgOrderId: string;

  constructor(private readonly dialog: MatDialog, private readonly orderDetailStore: OrderDetailStore) {}

  onTransferToAnotherCompanyClick(): void {
    this.dialog
      .open<TransferOrderDialogComponent, TransferOrderDialogData, Order | undefined>(TransferOrderDialogComponent, {
        data: { sgOrderId: this.sgOrderId }
      })
      .afterClosed()
      .pipe(filter(order => !isNil(order)))
      .subscribe(order => this.orderDetailStore.clearChangesAndUpdateGlobalState(order));
  }
}
