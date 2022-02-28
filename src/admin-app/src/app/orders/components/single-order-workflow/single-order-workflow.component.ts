import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Invoice, InvoiceType, Order } from '@solargis/types/customer';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

/**
 * WorFlow component for one order (status of order, ...)
 */
@Component({
  selector: 'sg-admin-single-order-workflow',
  templateUrl: './single-order-workflow.component.html',
  styleUrls: [ '../../shared-order-styles.scss', './single-order-workflow.component.scss' ]
})
export class SingleOrderWorkflowComponent extends SubscriptionAutoCloseComponent implements OnInit, OnChanges {

  @Input() order: Order;
  @Output() patch = new EventEmitter<Partial<Order>>();
  @Output() isOrderDoneChange = new EventEmitter<boolean>();

  readonly invoiceType = InvoiceType;
  form: FormGroup;

  changingStatus = false;
  isDoneStatus = false;

  constructor(private readonly fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      createdDatepicker: [{value: new Date(this.order.author.ts), disabled: true}, []],
      updatedDatepicker: [{value: new Date(this.order.updated.ts), disabled: true}, []],
      paymentDatepicker: [],
      deliveryDatepicker: [{value: null, disabled: true}, []],
      proFormaDatepicker: [{value: null, disabled: true}, []],
      invoiceDatepicker: [{value: null, disabled: true}, []],
      cnDatepicker: [{value: null, disabled: true}, []]
    });
  }

  ngOnChanges(): void {
    this.changingStatus = false;
    if (this.isOrderFinished()) {this.isOrderDoneChange.emit(true);}
  }

  isOrderFinished(): boolean {
    if (
        this.order.status.status === 'IN_PROGRESS' &&
        this.order.payment.status === 'PAID' &&
        this.order.author &&
        this.order.orderItemsProcessed
    ) {
      if (this.isPaymentFirst()) {
        if (this.getInvoice(InvoiceType.PROFA) && this.getInvoice(InvoiceType.INVOICE_FOR_PROFA)) {return this.isDoneStatus = true;}
      } else {
        if (this.getInvoice(InvoiceType.INVOICE)) {return this.isDoneStatus = true;}
      }
    }
  }

  isPaymentFirst(): boolean {
    return this.order.deliveryFirst === false || !!(typeof this.order.deliveryFirst === 'undefined' && this.getInvoice(InvoiceType.PROFA));
  }

  isDeliveryFirst(): boolean {
    return this.order.deliveryFirst === true || !!(typeof this.order.deliveryFirst === 'undefined' && this.getInvoice(InvoiceType.INVOICE));
  }

  deliveryChange(): boolean {
    return !!(this.order.deliveryFirst !== undefined || this.getInvoice(InvoiceType.PROFA) || this.getInvoice(InvoiceType.INVOICE));
  }

  getInvoice(type: InvoiceType): Invoice {
    const list = this.order.invoices || [];
    return list.find(i => i.type === type);
  }

  changeToDeliveryFirst(): void {
    this.changingStatus = true;
    this.patch.emit({ deliveryFirst: true });
  }

  changeToPaymentFirst(): void {
    this.changingStatus = true;
    this.patch.emit({ deliveryFirst: false });
  }

}
