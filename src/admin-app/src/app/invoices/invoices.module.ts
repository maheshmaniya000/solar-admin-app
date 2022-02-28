import { DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveComponentModule } from '@ngrx/component';

import { AdminSharedModule } from '../shared/admin-shared.module';
import { InvoicesTableComponent } from './components/invoices-table/invoices-table.component';
import { InvoicesToolbarComponent } from './components/invoices-toolbar/invoices-toolbar.component';
import { InvoiceNoteDialogComponent } from './dialogs/invoice-note-dialog/invoice-note-dialog.component';
import { CurrencyPipe } from './pipes/currency.pipe';

@NgModule({
  imports: [AdminSharedModule, ReactiveComponentModule],
  declarations: [
    InvoicesToolbarComponent,
    InvoicesTableComponent,
    InvoiceNoteDialogComponent,
    CurrencyPipe
  ],
  providers: [DecimalPipe]
})
export class InvoicesModule {}
