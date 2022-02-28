import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateRange } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { sortBy, isEmpty, isEqual, intersection } from 'lodash-es';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, switchMap, tap } from 'rxjs/operators';

import { NumberTuple, Page, StringTuple } from '@solargis/types/api';
import {
  InvoiceListFilter,
  InvoiceOrdersSummary,
  InvoiceWithOrder,
  OrderPaymentStatus,
  OrderPaymentType,
  OrderWithoutInvoices
} from '@solargis/types/customer';
import { Country } from '@solargis/types/user-company';
import { units } from '@solargis/units';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { filterByName } from 'ng-shared/shared/utils/filter.utils';
import { CompanyService } from 'ng-shared/user/services/company.service';

import { getOrderPriceWithoutVat, materialSortToSort } from '../../../shared/admin.utils';
import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { DownloadInvoiceStore } from '../../../shared/store/download-invoice/download-invoice.store';
import { fromAdmin } from '../../../store';
import { InvoiceColumn } from '../../constants/invoice-columns.enum';
import { InvoiceNoteDialogComponent } from '../../dialogs/invoice-note-dialog/invoice-note-dialog.component';
import { InvoicesActions, InvoicesSelectors } from '../../store';

@Component({
  selector: 'sg-admin-invoices-table',
  styleUrls: [
    '../../../shared/components/admin-common.styles.scss',
    '../../../shared/components/admin-tab.styles.scss',
    './invoices-table.component.scss'
  ],
  templateUrl: './invoices-table.component.html',
  providers: [DownloadInvoiceStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicesTableComponent extends SubscriptionAutoCloseComponent implements OnInit {
  readonly getOrderPriceWithoutVat = getOrderPriceWithoutVat;

  multiselect$: Observable<string[]>;
  allSelected$: Observable<boolean>;
  invoices$: Observable<InvoiceWithOrder[]>;
  count$: Observable<number>;
  summary$: Observable<InvoiceOrdersSummary>;
  page$: Observable<Page>;
  currency$: Observable<string>;
  columnsToDisplay$: Observable<string[]>;

  pageSizeOptions = [25, 50, 100];

  form: FormGroup;
  countryFormControl: FormControl;
  filteredCountries$: Observable<Country[]>;

  selection = new SelectionModel<string>(true);
  downloadInvoiceInProgress: { [invoiceCode: string]: boolean } = {};
  percentUnit = units['%0'];

  paymentTypes = {
    [OrderPaymentType.BANK]: 'Bank',
    [OrderPaymentType.PAY_PAL]: 'Paypal'
  };

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly dialog: MatDialog,
    private readonly companyService: CompanyService,
    private readonly detailNavigationService: DetailNavigationService,
    readonly downloadInvoiceStore:  DownloadInvoiceStore
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.store.dispatch(InvoicesActions.loadInvoices());
    this.columnsToDisplay$ = this.store
    .select(InvoicesSelectors.selectTableSettings)
    .pipe(map(settings => ['checkbox', ...intersection(settings.columns, Object.values(InvoiceColumn))]));
    this.invoices$ = this.store.select(InvoicesSelectors.selectAll);
    this.count$ = this.store.select(InvoicesSelectors.selectCount);
    this.page$ = this.store.select(InvoicesSelectors.selectPage);
    this.summary$ = this.store.select(InvoicesSelectors.selectSummary);
    this.currency$ = this.store.select(InvoicesSelectors.selectFilterCurrency);
    this.multiselect$ = this.store.select(InvoicesSelectors.selectMultiselect);
    this.allSelected$ = this.store.select(InvoicesSelectors.selectAllSelected);

    this.store
      .select(InvoicesSelectors.selectFilter)
      .pipe(first())
      .subscribe(f => this.patchForm(f));

    this.addSubscription(
      this.form.valueChanges.pipe(
        debounceTime(250),
        filter(changes => changes
          && this.isDateRangeComplete(changes.issueDate)
          && this.isDateRangeComplete(changes.dueDate)
          && this.isDateRangeComplete(changes.paymentDate)
        ),
      ).subscribe(() => {
        this.store.dispatch(InvoicesActions.changeFilter({ filter: this.getFilter() }));
      })
    );

    this.filteredCountries$ = this.countryFormControl.valueChanges.pipe(
      debounceTime(250),
      tap(countryFilter =>
        isEmpty(countryFilter)
          ? this.store.dispatch(InvoicesActions.changeFilter({
            filter: { order: { company: { country: null } } } as InvoiceListFilter
          }))
          : undefined
      ),
      switchMap(countryFilter => this.filterCountries(countryFilter))
    );

    this.addSubscription(
      this.multiselect$.subscribe(selection => isEmpty(selection) ? this.selection.clear() : this.selection.select(...selection))
    );
    this.addSubscription(this.selection.changed.pipe(
      distinctUntilChanged(isEqual)
    ).subscribe(() => this.store.dispatch(InvoicesActions.multiselect({ ids: this.selection.selected }))));

    this.addSubscription(
      this.store.select(InvoicesSelectors.selectSort).subscribe(sort => {
        this.sort.active = sort.sortBy;
        this.sort.direction = sort.direction;
      })
    );

    this.addSubscription(
      this.sort.sortChange.subscribe(materialSort =>
        this.store.dispatch(InvoicesActions.changeSort({ sort: materialSortToSort(materialSort) }))
      )
    );
  }

  onCountrySelected($event: MatAutocompleteSelectedEvent): void {
    const code = $event.option.value?.code;
    this.store.dispatch(InvoicesActions.changeFilter({
      filter: { order: { company: { country: code ? { code } : null } } } as InvoiceListFilter
    }));
  }

  onSelectAllClick(event: MouseEvent): void {
    event.preventDefault();
    this.store.dispatch(this.selection.hasValue() ? InvoicesActions.multiselectClear() : InvoicesActions.multiselectToggleAll());
  }

  filterCountries(countryFilter?: string): Observable<Country[]> {
    return this.companyService.listCountries().pipe(
      first(),
      map(countries => sortBy(filterByName(countries, countryFilter), ({ name }) => name))
    );
  }

  changePage(e: PageEvent): void {
    this.store.dispatch(InvoicesActions.changePage({ page: { size: e.pageSize, index: e.pageIndex } }));
  }

  countryDisplayFn(country?: Country): string | undefined {
    return country?.name;
  }

  editNote(order: OrderWithoutInvoices): void {
    this.dialog.open(InvoiceNoteDialogComponent, { data: order.note })
      .afterClosed()
      .pipe(first())
      .subscribe(note => this.store.dispatch(InvoicesActions.editNote({ order, note })));
  }

  selectOrder(order: OrderWithoutInvoices): void {
    this.detailNavigationService.toOrder(order, '/list/invoices');
  }

  getPaidAmount(order: OrderWithoutInvoices): number {
    return order.payment.status === OrderPaymentStatus.PAID ? order.price : 0;
  }

  getUnpaidAmount(order: OrderWithoutInvoices): number {
    return order.payment.status !== OrderPaymentStatus.PAID ? order.price : 0;
  }

  calculateVAT(summary: InvoiceOrdersSummary): number {
    return summary?.price - summary?.priceWithoutVat;
  }

  private isDateRangeComplete(range: DateRange<any>): boolean {
    return (range?.start && range?.end) || (!range?.start && !range?.end);
  }

  private createForm(): void {
    this.form = new FormBuilder().group({
      invoiceCode: [undefined],
      issueDate: new FormBuilder().group({
        start: [undefined],
        end: [undefined],
      }),
      dueDate: new FormBuilder().group({
        start: [undefined],
        end: [undefined],
      }),
      company: [undefined],
      author: [undefined],
      paymentType: [undefined],
      paymentDate: new FormBuilder().group({
        start: [undefined],
        end: [undefined],
      }),
    });
    this.countryFormControl = new FormControl();
  }

  private setFromFilter(val: any, key: string): void {
    if (isEmpty(val)) {
      return;
    }
    if (Array.isArray(val) && val[0] && val[1]) {
      const start = moment(val[0]).startOf('day').toDate();
      const end = moment(val[1]).endOf('day').toDate();

      this.form?.get(key)?.get('start')?.setValue(start, { emitEvent: false });
      this.form?.get(key)?.get('end')?.setValue(end, { emitEvent: false });
    }
    if (typeof val === 'string') {
      this.form?.get(key)?.setValue(val.replace(/[.*]/g, ''), { emitEvent: false });
    }
    if (typeof val === 'number') {
      this.form?.get(key)?.setValue(val, { emitEvent: false });
    }
  }

  private patchForm(f: InvoiceListFilter): void {
    this.setFromFilter(f.invoiceCode, 'invoiceCode');
    this.setFromFilter(f.issueDate, 'issueDate');
    this.setFromFilter(f.dueDate, 'dueDate');
    this.setFromFilter(f.order?.company?.name, 'company');
    this.setFromFilter(f.order?.author?.user?.email, 'author');
    this.setFromFilter(f.order?.payment?.type, 'paymentType');
    this.setFromFilter(f.order?.payment?.paymentDate, 'paymentDate');
    this.companyService
      .findCountryByCode(f?.order?.company?.country?.code)
      .pipe(first())
      .subscribe(country => this.countryFormControl.setValue(country, { emitEvent: false }));
  }

  private parseStringFormValue(key: string): string {
    const val = this.form?.get(key).value?.trim();
    return val ?? null;
  }

  private parseStringDateFormValue(key: string): StringTuple {
    const val = this.form?.get(key).value;
    const dateFormat = 'YYYY-MM-DD';
    return val && val.start && val.end ? [moment(val.start).format(dateFormat), moment(val.end).format(dateFormat)] : null;
  }

  private parseNumberDateFormValue(key: string): NumberTuple {
    const val = this.form?.get(key).value;
    return val && val.start && val.end ? [moment(val.start).startOf('day').valueOf(), moment(val.end).endOf('day').valueOf()] : null;
  }

  private getFilter(): Partial<InvoiceListFilter> {
    const [invoiceCode, company, author, paymentType, issueDate, dueDate, paymentDate] = [
      this.parseStringFormValue('invoiceCode'),
      this.parseStringFormValue('company'),
      this.parseStringFormValue('author'),
      this.form?.get('paymentType').value?.trim(),
      this.parseStringDateFormValue('issueDate'),
      this.parseStringDateFormValue('dueDate'),
      this.parseNumberDateFormValue('paymentDate'),
    ];

    return {
      invoiceCode,
      issueDate,
      dueDate,
      order: {
        company: { name: company },
        author: author ? { user: { email: author } } : null,
        payment: paymentType || paymentDate ? { type: paymentType, paymentDate } : null,
      } as any,
    } as Partial<InvoiceListFilter>;
  }
}
