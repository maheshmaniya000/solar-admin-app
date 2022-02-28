import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { intersection, isEmpty, isEqual, toString } from 'lodash-es';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map } from 'rxjs/operators';

import { Page } from '@solargis/types/api';
import {
  getInvoice,
  InvoiceType,
  Order,
  OrderListFilter,
  OrderPaymentStatus,
  OrderPaymentType,
  OrderStatusType
} from '@solargis/types/customer';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import {
  fromDateFilterValues,
  materialSortToSort,
  toFilterValue,
  toTimestampFilterValues
} from '../../../shared/admin.utils';
import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { DownloadInvoiceStore } from '../../../shared/store/download-invoice/download-invoice.store';
import { fromAdmin } from '../../../store';
import { OrderColumn } from '../../constants/order-columns.enum';
import { fromOrders, OrdersActions, OrdersSelectors } from '../../store';

@Component({
  selector: 'sg-admin-orders',
  styleUrls: [
    '../../../shared/components/admin-common.styles.scss',
    '../../../shared/components/admin-tab.styles.scss',
    './orders-table.component.scss'
  ],
  templateUrl: './orders-table.component.html',
  providers: [DownloadInvoiceStore]
})
export class OrdersTableComponent extends SubscriptionAutoCloseComponent implements OnInit {
  multiselect$: Observable<string[]>;
  allSelected$: Observable<boolean>;
  orders$: Observable<Order[]>;
  count$: Observable<number>;
  columnsToDisplay$: Observable<string[]>;
  page$: Observable<Page>;

  pageSizeOptions = [25, 50, 100];
  form: FormGroup;
  selection = new SelectionModel<string>(true);

  readonly invoiceType = InvoiceType;
  readonly paymentTypes = {
    [OrderPaymentType.BANK]: 'Bank',
    [OrderPaymentType.PAY_PAL]: 'Paypal'
  };
  readonly paymentStatuses = [OrderPaymentStatus.NOT_PAID, OrderPaymentStatus.PAID];
  readonly statuses: OrderStatusType[] = ['USER_STARTED', 'IN_PROGRESS', 'DONE', 'CANCELED', 'EXPIRED'];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    readonly downloadInvoiceStore: DownloadInvoiceStore,
    private readonly store: Store<fromAdmin.State>,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super();
  }

  getPaymentTypeFormControl(): FormControl {
    return this.form?.get('payment').get('type') as FormControl;
  }

  getPaymentStatusFormControl(): FormControl {
    return this.form?.get('payment').get('status') as FormControl;
  }

  getCompanyNameFormControl(): FormControl {
    return this.form?.get('company').get('name') as FormControl;
  }

  getAuthorUserEmailFormControl(): FormControl {
    return this.form.get('author').get('user').get('email') as FormControl;
  }

  getUpdatedTimestampFormGroup(): FormGroup {
    return this.form?.get('updated').get('ts') as FormGroup;
  }

  getAuthorTimestampFormGroup(): FormGroup {
    return this.form?.get('author').get('ts') as FormGroup;
  }

  getStatusFormControl(): FormControl {
    return this.form?.get('status').get('status') as FormControl;
  }

  ngOnInit(): void {
    this.createForm();
    this.store.dispatch(OrdersActions.load());
    this.orders$ = this.store.select(OrdersSelectors.selectAll);
    this.count$ = this.store.select(OrdersSelectors.selectCount);
    this.page$ = this.store.select(OrdersSelectors.selectPage);
    this.columnsToDisplay$ = this.store
      .select(OrdersSelectors.selectTableSettings)
      .pipe(map(settings => ['checkbox', ...intersection(settings.columns, Object.values(OrderColumn))]));
    this.multiselect$ = this.store.select(OrdersSelectors.selectMultiselect);
    this.allSelected$ = this.store.select(OrdersSelectors.selectAllSelected);
    this.addSubscription(
      this.multiselect$.subscribe(selection => isEmpty(selection) ? this.selection.clear() : this.selection.select(...selection))
    );
    this.addSubscription(this.selection.changed.pipe(
      distinctUntilChanged(isEqual)
    ).subscribe(() => this.store.dispatch(OrdersActions.multiselect({ ids: this.selection.selected }))));

    this.addSubscription(
      this.form.valueChanges
        .pipe(
          debounceTime(500),
          map(() => this.getFilter()),
          distinctUntilChanged<OrderListFilter>(isEqual)
        )
        .subscribe(orderListFilter => this.store.dispatch(OrdersActions.changeFilter({ filter: orderListFilter })))
    );

    this.addSubscription(
      this.store
        .select(OrdersSelectors.selectFilter)
        .pipe(first())
        .subscribe(orderListFilter => this.patchForm(orderListFilter))
    );

    this.addSubscription(
      this.store
        .select(OrdersSelectors.selectFilter)
        .pipe(filter(orderListFilter => isEqual(orderListFilter, fromOrders.initialFilter)))
        .subscribe(orderListFilter => {
          this.form.reset(undefined, { emitEvent: false });
          this.patchForm(orderListFilter);
        })
    );

    this.addSubscription(
      this.store.select(OrdersSelectors.selectSort).subscribe(sort => {
        this.sort.active = sort.sortBy?.replace(/\./g, '_');
        this.sort.direction = sort.direction;
      })
    );
    this.addSubscription(
      this.sort.sortChange.subscribe(materialSort =>
        this.store.dispatch(OrdersActions.changeSort({ sort: materialSortToSort(materialSort) }))
      )
    );
  }

  onRowClicked(order: Order): void {
    this.detailNavigationService.toOrderAndSelect(order);
  }

  onSelectAllClick(event: MouseEvent): void {
    event.preventDefault();
    this.store.dispatch(this.selection.hasValue() ? OrdersActions.multiselectClear() : OrdersActions.multiselectToggleAll());
  }

  onPageChanged(event: PageEvent): void {
    this.store.dispatch(OrdersActions.changePage({ page: { size: event.pageSize, index: event.pageIndex } }));
  }

  onCopyButtonClick(order: Order): void {
    this.detailNavigationService.toAddOrder(order);
  }

  private createForm(): void {
    const fb = new FormBuilder();
    this.form = fb.group({
      sgOrderId: [undefined, []],
      company: fb.group({
        name: [undefined, []]
      }),
      author: fb.group({
        user: fb.group({
          email: [undefined, []]
        }),
        ts: fb.group({
          start: [undefined, []],
          end: [undefined, []]
        })
      }),
      payment: fb.group({
        type: [undefined, []],
        status: [undefined, []]
      }),
      updated: fb.group({
        ts: fb.group({
          start: [undefined, []],
          end: [undefined, []]
        })
      }),
      note: [undefined, []],
      status: fb.group({
        status: [undefined, []]
      }),
      invoiceCode: [undefined, []],
      profaInvoiceCode: [undefined, []]
    });
  }

  private patchForm(orderListFilter: OrderListFilter): void {
    this.form.markAllAsTouched();
    this.form.markAsDirty();
    this.form.patchValue(
      {
        ...orderListFilter,
        author: {
          ...orderListFilter?.author,
          ts: fromDateFilterValues(orderListFilter?.author?.ts)
        },
        updated: {
          ts: fromDateFilterValues(orderListFilter?.updated?.ts)
        },
        status: {
          status: orderListFilter?.status?.status?.map(toString)
        }
      },
      { emitEvent: false }
    );
  }

  private getFilter(): OrderListFilter {
    return {
      sgOrderId: toFilterValue(this.form?.get('sgOrderId').value),
      company: {
        name: toFilterValue(this.getCompanyNameFormControl().value)
      },
      author: {
        user: {
          email: toFilterValue(this.getAuthorUserEmailFormControl().value)
        },
        ts: toTimestampFilterValues(this.getAuthorTimestampFormGroup().value)
      },
      payment: {
        type: this.getPaymentTypeFormControl().value,
        status: this.getPaymentStatusFormControl().value
      },
      updated: {
        ts: toTimestampFilterValues(this.getUpdatedTimestampFormGroup().value)
      },
      note: toFilterValue(this.form?.get('note').value),
      status: {
        status: this.getStatusFormControl().value.map(value => (value === '' ? null : value))
      },
      invoiceCode: toFilterValue(this.form?.get('invoiceCode').value),
      profaInvoiceCode: toFilterValue(this.form?.get('profaInvoiceCode').value)
    };
  }

  isPaidButNotFullyInvoiced(order: Order): boolean {
    return order?.payment?.status === 'PAID'
      && !!getInvoice(order, InvoiceType.PROFA)
      && !getInvoice(order, InvoiceType.INVOICE_FOR_PROFA)
      && !getInvoice(order, InvoiceType.INVOICE);
  }
}
