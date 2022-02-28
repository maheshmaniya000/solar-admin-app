import { NgModule } from '@angular/core';

import { AppSubscriptionModule } from 'ng-shared/app-subscription/app-subscription.module';

import { AdminSharedModule } from '../shared/admin-shared.module';
import { OrderCompanyEditorComponent } from './components/order-editor/order-company-editor/order-company-editor.component';
import { OrderCompanySummaryComponent } from './components/order-editor/order-company-summary/order-company-summary.component';
import { OrderCompanyTransferComponent } from './components/order-editor/order-company-transfer/order-company-transfer.component';
import { OrderContactsComponent } from './components/order-editor/order-contacts/order-contacts.component';
import { OrderCurrencyComponent } from './components/order-editor/order-currency/order-currency.component';
import { OrderDiscountComponent } from './components/order-editor/order-discount/order-discount.component';
import { OrderEditorComponent } from './components/order-editor/order-editor.component';
import { OrderItemEditorComponent } from './components/order-editor/order-item-editor/order-item-editor.component';
import { OrderItemsEditorComponent } from './components/order-editor/order-items-editor/order-items-editor.component';
import { OrderTitleAndCodesComponent } from './components/order-editor/order-title-and-codes/order-title-and-codes.component';
import { OrderVatAndTotalComponent } from './components/order-editor/order-vat-and-total/order-vat-and-total.component';
import { OrderInvoicesComponent } from './components/order-invoices/order-invoices.component';
import { OrderItemsViewComponent } from './components/order-view/order-items-view/order-items-view.component';
import { OrderViewComponent } from './components/order-view/order-view.component';
import { OrderWorkflowComponent } from './components/order-workflow/order-workflow.component';
import { OrderItemsTableCellComponent } from './components/orders-table/order-items-table-cell/order-items-table-cell.component';
import { OrdersTableComponent } from './components/orders-table/orders-table.component';
import { OrdersToolbarComponent } from './components/orders-toolbar/orders-toolbar.component';
import { SDATSubscriptionComponent } from './components/sdat-subscription/sdat-subscription.component';
import { SingleInvoiceComponent } from './components/single-invoice/single-invoice.component';
import { SingleOrderWorkflowComponent } from './components/single-order-workflow/single-order-workflow.component';
import { ViewOrderToolsComponent } from './components/view-order-tools/view-order-tools.component';
import { OrderDetailComponent } from './containers/order-detail/order-detail.component';
import { ExpireOrderDialogComponent } from './dialogs/expire-order/expire-order-dialog.component';
import { TransferOrderDialogComponent } from './dialogs/transfer-order/transfer-order-dialog.component';

@NgModule({
  imports: [AdminSharedModule, AppSubscriptionModule],
  declarations: [
    OrdersToolbarComponent,
    OrdersTableComponent,
    ExpireOrderDialogComponent,
    TransferOrderDialogComponent,
    SingleInvoiceComponent,
    SingleOrderWorkflowComponent,
    SDATSubscriptionComponent,
    OrderItemEditorComponent,
    OrderItemsEditorComponent,
    OrderDiscountComponent,
    OrderDetailComponent,
    OrderItemsViewComponent,
    OrderViewComponent,
    ViewOrderToolsComponent,
    OrderCurrencyComponent,
    OrderVatAndTotalComponent,
    OrderTitleAndCodesComponent,
    OrderCompanyEditorComponent,
    OrderContactsComponent,
    OrderEditorComponent,
    OrderWorkflowComponent,
    OrderInvoicesComponent,
    OrderItemsTableCellComponent,
    OrderCompanySummaryComponent,
    OrderCompanyTransferComponent
  ],
  providers: [],
  entryComponents: [ExpireOrderDialogComponent, TransferOrderDialogComponent]
})
export class OrdersModule {}
