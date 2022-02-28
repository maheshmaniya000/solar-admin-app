import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { cloneDeep, differenceBy, isEmpty, isNil, sum } from 'lodash-es';
import { EMPTY, forkJoin, MonoTypeOperatorFunction, Observable, ObservedValueOf, of, OperatorFunction, pipe } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, first, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  applyDiscountToPrice,
  applyVatPercentToPrice,
  CreateInvoiceInput,
  getInvoice,
  getInvoiceFileName,
  Invoice,
  InvoiceType,
  isEUCompany,
  Order,
  OrderPayment,
  OrderPaymentStatus,
  Product,
  roundToTwoDecimalPlaces,
  UpdateOrderOpts,
} from '@solargis/types/customer';
import { Company, ContactPerson, User, UserCompanyDetails } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { SelectOption } from 'components/models/select-option.model';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogMultiInput,
  ConfirmationDialogSimpleInput
} from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { downloadBinaryFile, MimeType } from 'ng-shared/shared/utils/download.utils';
import { userFullName } from 'ng-shared/shared/utils/user.utils';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { distinctByCompanyId } from 'ng-shared/user/utils/distinct-company.operator';

import { ensureNotEmpty, ensureNotEmptyObject } from '../../shared/admin.utils';
import { AdminInvoicesService } from '../../shared/services/admin-invoices.service';
import { AdminOrdersService } from '../../shared/services/admin-orders.service';
import { AdminProductsService } from '../../shared/services/admin-products.service';
import { AdminUsersCompaniesService } from '../../shared/services/admin-users-companies.service';
import { DetailNavigationService } from '../../shared/services/detail-navigation.service';
import { EntityDetailState, EntityDetailStore, EntityDetailViewModel } from '../../shared/services/entity-detail.store';
import { AdminActions, fromAdmin } from '../../store';
import { ExpireOrderDialogComponent } from '../dialogs/expire-order/expire-order-dialog.component';
import { OrdersActions } from '../store';

export interface OrderDetailState extends EntityDetailState<Order> {
  company: Company;
  editingCompanySnapshot: boolean;
  products: Product[];
  companyUsers: UserCompanyDetails[];
  downloadingVies: boolean;
  downloadingActualVies: boolean;
  changingStatus: boolean;
  changingPayment: boolean;
  paymentValid: boolean;
  invoice: {
    formVisible: boolean;
    updating: boolean;
    downloading: Record<number, boolean>;
    sign: boolean;
  };
}

export interface OrderViewModel extends EntityDetailViewModel<Order>, OrderDetailState {
  saved: boolean;
  currencyChangeDisabled: boolean;
  customCurrency: boolean;
  companyNote: string;
  companySelectorVisible: boolean;
  downloadActualViesValidationVisible: boolean;
  downloadViesValidationVisible: boolean;
  availableCompanyUsers: User[];
  availableCompanyContacts: ContactPerson[];
  contactSelectEnabled: boolean;
  paymentVisible: boolean;
  hasInvoices: boolean;
  totals: {
    price: number;
    priceWithVAT: number;
    quantity: number;
  };
}

type DownloadViesParams = {
  order: Order;
  current: boolean;
  finalizeFn: () => void;
  sign?: boolean;
};

@Injectable()
export class OrderDetailStore extends EntityDetailStore<Order, OrderDetailState> {
  readonly setCompany = this.updater((state, company: Company) => ({
    ...state,
    company
  }));

  readonly setProducts = this.updater((state, products: Product[]) => ({
    ...state,
    products
  }));

  readonly setCompanyUsers = this.updater((state, companyUsers: UserCompanyDetails[]) => ({
    ...state,
    companyUsers
  }));

  readonly setChangingStatus = this.updater((state, changingStatus: boolean) => ({
    ...state,
    changingStatus
  }));

  readonly setDownloadingVies = this.updater((state, downloadingVies: boolean) => ({
    ...state,
    downloadingVies
  }));

  readonly setDownloadingActualVies = this.updater((state, downloadingActualVies: boolean) => ({
    ...state,
    downloadingActualVies
  }));

  readonly setPaymentValid = this.updater((state, paymentValid: boolean) => ({
    ...state,
    paymentValid
  }));

  readonly setInvoiceFormVisible = this.updater((state, formVisible: boolean) => ({
    ...state,
    invoice: {
      ...state.invoice,
      formVisible
    }
  }));

  readonly setInvoiceUpdating = this.updater((state, updating: boolean) => ({
    ...state,
    invoice: {
      ...state.invoice,
      updating
    }
  }));

  readonly setInvoiceSign = this.updater((state, sign: boolean) => ({
    ...state,
    invoice: {
      ...state.invoice,
      sign
    }
  }));

  readonly setInvoiceDownloading = this.updater((state, downloading: { index: number; status: boolean }) => ({
    ...state,
    invoice: {
      ...state.invoice,
      downloading: {
        ...state.invoice.downloading,
        [downloading.index]: downloading.status
      }
    }
  }));

  readonly setEditingCompanySnapshot = this.updater((state, editingCompanySnapshot: boolean) => ({
    ...state,
    editingCompanySnapshot
  }));

  readonly toggleEditingCompanySnapshot = this.updater(state => ({
    ...state,
    editingCompanySnapshot: !state.editingCompanySnapshot
  }));

  setUnsavedEntity = this.updater((state: OrderDetailState, unsavedEntity: Partial<Order>) => ({
    ...state,
    unsavedEntity: {
      ...state.entity,
      ...unsavedEntity,
      company: {
        ...state.entity.company,
        ...unsavedEntity.company
      }
    }
  }));

  readonly company$ = this.select(this.state$, state => state.company);
  readonly products$ = this.select(this.state$, state => state.products);

  readonly viewModel$: Observable<OrderViewModel> = this.select(this.createViewModel$(), this.state$, (entityViewModel, state) => {
    const saved = !isNil(state.entity?.sgOrderId);
    const hasInvoice = saved && !isNil(getInvoice(state.entity));
    const availableCompanyContacts = differenceBy(state.company?.contacts, state.unsavedEntity?.contacts, contact => contact.email);
    const availableCompanyUsers = differenceBy(state.companyUsers, state.unsavedEntity?.contacts, user => user.email);
    const hasInvoices = !isEmpty(state.entity?.invoices);
    const companyHasVatId = !isNil(state.entity?.company?.VAT_ID);
    return {
      ...entityViewModel,
      ...state,
      saved,
      currencyChangeDisabled: hasInvoice,
      customCurrency: !['€', '$'].includes(state.unsavedEntity?.currency),
      companyNote: saved ? state.entity.company.note : state.company?.note,
      companySelectorVisible: !saved && isNil(state.unsavedEntity?.sgCompanyId),
      downloadActualViesValidationVisible: saved && companyHasVatId,
      downloadViesValidationVisible: hasInvoices && saved && companyHasVatId,
      availableCompanyContacts,
      availableCompanyUsers,
      contactSelectEnabled: !isEmpty(availableCompanyContacts) || !isEmpty(availableCompanyUsers),
      paymentVisible:
        (!isNil(state.entity.deliveryFirst) || this.hasInvoiceType(state.entity, InvoiceType.PROFA, InvoiceType.INVOICE)) &&
        state.entity.payment?.status !== OrderPaymentStatus.PAID,
      hasInvoices,
      totals: this.calculateTotals(state.unsavedEntity)
    };
  });

  readonly companyUsers$ = this.select(this.state$, state => state.companyUsers);
  readonly currency$ = this.select(this.unsavedEntity$, order => order?.currency);

  readonly availablePhones$ = this.select(this.companyUsers$, this.unsavedEntity$, this.company$, (companyUsers, unsavedOrder, company) => {
    const result: SelectOption<string>[] = [];
    const companyForPhone = unsavedOrder?.sgOrderId ? unsavedOrder?.company : company;
    if (companyForPhone?.phone) {
      result.push({ value: companyForPhone.phone, label: companyForPhone.name });
    }
    const contacts = unsavedOrder?.contacts.filter(contact => !isNil(contact.phone)) ?? [];
    result.push(...contacts.map((contact: ContactPerson) => ({ value: contact.phone, label: userFullName(contact) })));
    return result;
  });

  readonly create = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsertOrder({
        operation: 'create',
        successMessage: 'Order has been created',
        errorMessage: 'Order could NOT be created',
        afterSuccess: (order: Order) => this.detailNavigationService.toOrderAndSelect(order)
      })
    )
  );

  readonly update = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsertOrder({
        operation: 'update',
        successMessage: 'Order data has been saved',
        errorMessage: 'Order data could NOT be saved',
        afterSuccess: (order: Order) => this.detailNavigationService.toOrderAndSelect(order)
      })
    )
  );

  readonly updatePayment = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      tap(() => this.setUpdating(true)),
      switchMap(() => this.unsavedEntity$.pipe(first())),
      switchMap(order =>
        this.adminOrdersService.updateOrder(order.sgOrderId, { payment: this.sanitizePayment(order.payment) }).pipe(
          tap({
            next: updatedOrder => {
              this.clearChangesAndUpdateGlobalState(updatedOrder);
              this.showSnackbarMessage({
                message: 'Order payment has been changed',
                styleClass: 'snackbarPass'
              });
            },
            error: error => {
              console.error(error);
              this.showSnackbarMessage({
                message: 'Order payment could not be changed',
                styleClass: 'snackbarError'
              });
            }
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdating(false))
        )
      )
    )
  );

  readonly downloadActualViesValidation = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      tap(() => this.setDownloadingActualVies(true)),
      withLatestFrom(this.entity$),
      switchMap(([, order]) =>
        this.downloadVies({ order, current: true, finalizeFn: () => this.setDownloadingActualVies(false) })
      )
    )
  );

  readonly downloadViesValidation = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      tap(() => this.setDownloadingVies(true)),
      withLatestFrom(this.state$),
      switchMap(([, { entity: order, invoice: { sign } }]) =>
        this.downloadVies({ order, current: false, sign, finalizeFn: () => this.setDownloadingVies(false) })
      )
    )
  );

  readonly loadCompanyUsers = this.effect((sgCompanyId$: Observable<string>) =>
    sgCompanyId$.pipe(
      switchMap(sgCompanyId =>
        isNil(sgCompanyId)
          ? of([])
          : this.adminUsersCompaniesService.listUsersForCompany(sgCompanyId).pipe(
              map(users => users.filter(user => !isNil(user.email))),
              tap({
                error: error => {
                  console.error(error);
                  this.showSnackbarMessage({
                    message: 'Could not load company users',
                    styleClass: 'snackbarError'
                  });
                }
              }),
              catchError(() => of([]))
            )
      ),
      tap<UserCompanyDetails[]>(users => this.setCompanyUsers(users))
    )
  );

  readonly expire = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.confirmExpire()),
      map(() => 'EXPIRED'),
      this.updateStatus()
    )
  );

  readonly changeStatus = this.effect((status$: Observable<'DONE' | 'CANCELED'>) => status$.pipe(this.updateStatus()));
  readonly changePayment = this.effect((order$: Observable<Partial<Order>>) =>
    order$.pipe(
      switchMap(updatedOrder =>
        this.entity$.pipe(
          first(),
          map(existingOrder => ({ ...existingOrder, ...updatedOrder }))
        )
      ),
      this.upsertOrder({
        operation: 'update',
        successMessage: 'Order payment has been changed',
        errorMessage: 'Order payment could NOT be changed'
      })
    )
  );

  readonly upsertInvoice = this.effect((status$: Observable<{ request: CreateInvoiceInput; invoiceCode?: string }>) =>
    status$.pipe(
      tap(() => this.setInvoiceUpdating(true)),
      withLatestFrom(this.entity$),
      switchMap(([{ request, invoiceCode }, order]) =>
        (isNil(invoiceCode)
          ? this.invoiceService.createInvoice(order.sgOrderId, request)
          : this.invoiceService.updateInvoice(order.sgOrderId, invoiceCode, request)
        ).pipe(
          tap({
            next: updatedOrder => {
              this.setInvoiceFormVisible(false);
              this.clearChangesAndUpdateGlobalState(updatedOrder);
              this.showSnackbarMessage({
                message: isNil(invoiceCode) ? `Invoice has been created` : `Invoice ${invoiceCode} has been updated`,
                styleClass: 'snackbarPass'
              });
            },
            error: error => {
              console.error(error);
              this.showSnackbarMessage({
                message: `Invoice could NOT be ${isNil(invoiceCode) ? 'created' : 'updated'}`,
                styleClass: 'snackbarError'
              });
            }
          }),
          catchError(() => EMPTY),
          finalize(() => this.setInvoiceUpdating(false))
        )
      )
    )
  );

  readonly downloadInvoice = this.effect(($index: Observable<number>) =>
    $index.pipe(
      tap(index => this.setInvoiceDownloading({ index, status: true })),
      withLatestFrom(this.state$),
      mergeMap(([index, { entity: order, invoice: { sign } }]) =>
        this.invoiceService.downloadInvoice(order.sgCompanyId, order.sgOrderId, order.invoices[index].invoiceCode, !sign).pipe(
          tap({
            next: response =>
              downloadBinaryFile(
                response,
                getInvoiceFileName(order.invoices[index], order?.company?.name),
                MimeType.PDF,
                this.snackBar
              ),
            error: error => {
              console.error(error);
              this.showSnackbarMessage({
                message: `Invoice could NOT be downloaded`,
                styleClass: 'snackbarError'
              });
            }
          }),
          catchError(() => EMPTY),
          finalize(() => this.setInvoiceDownloading({ index, status: false }))
        )
      )
    )
  );

  readonly cancelOrder = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.confirmCancelOrder()),
      tap(() => this.changeStatus('CANCELED'))
    )
  );

  readonly deleteInvoice = this.effect((index$: Observable<number>) =>
    index$.pipe(
      switchMap(index => this.confirmDeleteCreditNote().pipe(map(() => index))),
      tap(index => this.setInvoiceDownloading({ index, status: true })),
      withLatestFrom(this.entity$),
      switchMap(([index, order]) =>
        this.invoiceService.deleteInvoice(order.sgOrderId, order.invoices[index].invoiceCode).pipe(
          tap({
            next: updatedOrder => this.clearChangesAndUpdateGlobalState(updatedOrder),
            error: (error: HttpErrorResponse) => {
              console.error(error);
              if (error.status === 403) {
                this.showSnackbarMessage({
                  message: `Credit note could NOT be deleted. There is already another credit note in sequence`,
                  styleClass: 'snackbarError'
                });
              } else {
                this.showSnackbarMessage({
                  message: `Credit note could NOT be deleted. Unknown error`,
                  styleClass: 'snackbarError'
                });
              }
            }
          }),
          catchError(() => EMPTY),
          finalize(() => this.setInvoiceDownloading({ index, status: false }))
        )
      )
    )
  );

  readonly loadActualCompany = this.effect((sgCompanyId$: Observable<string>) =>
    sgCompanyId$.pipe(
      tap(() => this.setCompany(undefined)),
      filter(sgCompanyId => !isNil(sgCompanyId)),
      switchMap(sgCompanyId =>
        this.adminUsersCompaniesService.getCompany(sgCompanyId).pipe(
          tap({
            next: company => this.setCompany(company),
            error: (error: HttpErrorResponse) => {
              console.error(error);
              this.showSnackbarMessage({
                message: `Couldn't load actual company.`,
                styleClass: 'snackbarError'
              });
            }
          }),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(
    private readonly adminOrdersService: AdminOrdersService,
    private readonly adminProductsService: AdminProductsService,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly store: Store<fromAdmin.State>,
    private readonly companyService: CompanyService,
    private readonly dialog: MatDialog,
    private readonly detailNavigationService: DetailNavigationService,
    private readonly invoiceService: AdminInvoicesService,
    private readonly snackBar: MatSnackBar
  ) {
    super({
      company: undefined,
      editingCompanySnapshot: false,
      products: [],
      companyUsers: [],
      changingStatus: false,
      changingPayment: false,
      downloadingVies: false,
      downloadingActualVies: false,
      paymentValid: true,
      invoice: {
        formVisible: false,
        updating: false,
        downloading: [],
        sign: true
      }
    });
    this.setProducts(this.adminProductsService.listProducts(false));
    this.loadCompanyUsers(
      this.unsavedEntity$.pipe(
        distinctByCompanyId(),
        map(order => order?.sgCompanyId)
      )
    );
    this.loadActualCompany(
      this.unsavedEntity$.pipe(
        map(order => order?.sgCompanyId),
        distinctUntilChanged(),
        withLatestFrom(this.company$),
        filter(([companyToLoadId, loadedCompany]) => companyToLoadId !== loadedCompany?.sgCompanyId),
        map(([companyToLoadId]) => companyToLoadId)
      )
    );
  }

  isCompanyValid(company: Company): Observable<null | ValidationErrors> {
    return isNil(company)
      ? of(null)
      : forkJoin([this.isVatValid(company), this.isCompanyDataValid(company)]).pipe(
          map(([vatValid, dataValid]) =>
            vatValid && dataValid ? null : { VAT: !vatValid ? true : undefined, data: !dataValid ? true : undefined }
          )
        );
  }

  clearChangesAndUpdateGlobalState(order: Order): void {
    this.clearChanges(order);
    this.store.dispatch(OrdersActions.updated({ order }));
  }

  private isVatValid(company: Company): Observable<boolean> {
    return !isNil(company.VAT_ID) && isEUCompany(company)
            ? this.companyService.validateVatId(company, company.VAT_ID)
            : of(true);
  }

  private isCompanyDataValid(company: Company): Observable<boolean> {
    if (company.country) {
      return this.companyService.findCountryByCode(company.country.code).pipe(
        first(),
        map(country => {
          if (!isEmpty(country?.states) && isNil(company.state)) {
            return false;
          }
          if (isEUCompany(company) && !company.VAT_ID) { return false; };
          if (!company.name || !company.country?.name || !company.city) {
            return false;
          }
          return true;
        })
      );
    } else { return of(false); };
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError'; duration?: number }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }

  private calculateTotals(order: Order): { price: number; priceWithVAT: number; quantity: number } {
    if (isNil(order)) {
      return {
        price: 0,
        priceWithVAT: 0,
        quantity: 0
      };
    }
    const orderItemsPrice = roundToTwoDecimalPlaces(
      sum(order.orderItems.map(({ price, discount }) => applyDiscountToPrice(price, discount)))
    ) as number;
    const totalPrice = applyDiscountToPrice(
      Math.abs(orderItemsPrice),
      order.discount
    );

    return {
      price: totalPrice,
      priceWithVAT: applyVatPercentToPrice(totalPrice, order.VAT_ID),
      quantity: sum(order.orderItems.map(({ quantity }) => quantity))
    };
  }

  private hasInvoiceType(order: Order, ...types: InvoiceType[]): boolean {
    return types.some(type => !isNil(this.findInvoiceByType(order, type)));
  }

  private findInvoiceByType(order: Order, type: InvoiceType): Invoice | undefined {
    return (order?.invoices ?? []).find(invoice => invoice.type === type);
  }

  private upsertOrder(config: {
    operation: 'create' | 'update';
    successMessage: string;
    errorMessage: string;
    afterSuccess?: (order: Order) => void;
  }): MonoTypeOperatorFunction<Order> {
    return pipe(
      tap(() => this.setUpdating(true)),
      map(order => cloneDeep(order)),
      switchMap(order =>
        (config.operation === 'create' ?
          this.adminOrdersService.createOrder(order) :
          this.adminOrdersService.updateOrder(order.sgOrderId, this.orderToUpdateOrderOpts(order))
        ).pipe(
          tap({
            next: updatedOrder => {
              this.clearChangesAndUpdateGlobalState(updatedOrder);
              this.setEditingCompanySnapshot(false);
              this.showSnackbarMessage({
                message: config.successMessage,
                styleClass: 'snackbarPass'
              });
              config.afterSuccess?.(updatedOrder);
            },
            error: error => {
              console.error(error);
              this.showSnackbarMessage({
                message: config.errorMessage,
                styleClass: 'snackbarError'
              });
            }
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdating(false))
        )
      )
    );
  }

  private updateStatus(): OperatorFunction<'DONE' | 'CANCELED' | 'EXPIRED', ObservedValueOf<Observable<Order>>> {
    return pipe(
      tap(() => this.setChangingStatus(true)),
      withLatestFrom(this.entity$),
      switchMap(([newStatus, order]) =>
        this.adminOrdersService.updateOrder(order.sgOrderId, { status: { status: newStatus }}).pipe(
          tap({
            next: updatedOrder => {
              this.clearChangesAndUpdateGlobalState(updatedOrder);
              this.showSnackbarMessage({ message: 'Order status has been changed', styleClass: 'snackbarPass' });
            },
            error: () =>
              this.showSnackbarMessage({
                message: 'Order status could not be changed',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setChangingStatus(false))
        )
      )
    );
  }

  private downloadVies({ order, current, finalizeFn, sign }: DownloadViesParams): Observable<any> {
    return this.adminUsersCompaniesService.downloadViesValidation(order.sgCompanyId, order.sgOrderId, current, !sign).pipe(
      tap({
        next: res => {
          downloadBinaryFile(
            res,
            `solargis_VIES_verification_fo_company_ID_${order.company.name.replace(/ /g, '-')}.pdf`,
            MimeType.PDF,
            this.snackBar
          );
        },
        error: () =>
          this.showSnackbarMessage({
            message: 'VIES validation could NOT be downloaded',
            styleClass: 'snackbarError'
          })
      }),
      catchError(() => EMPTY),
      finalize(finalizeFn)
    );
  }

  private confirmExpire(): Observable<boolean> {
    return this.dialog
      .open(ExpireOrderDialogComponent)
      .afterClosed()
      .pipe(filter(result => result === true));
  }

  private confirmDeleteCreditNote(): Observable<boolean> {
    return this.openConfirmDialog(
      {
        heading: 'Invoice deletion',
        text: 'Do you really want to delete credit note?'
      }
    );
  }

  private confirmCancelOrder(): Observable<boolean> {
    return this.openConfirmDialog({
      heading: 'Cancel Order',
      text: 'Are you sure you want to Cancel this Order?',
      actions: [{
        text: 'No',
        value: false
      }, {
        text: 'Yes',
        value: true,
        default: true
      }]
    });
  }

  private openConfirmDialog(data: ConfirmationDialogSimpleInput | ConfirmationDialogMultiInput): Observable<boolean> {
    return this.dialog
      .open(ConfirmationDialogComponent, {data})
      .afterClosed()
      .pipe(filter(result => result === true));
  }

  private orderToUpdateOrderOpts(order: Order): UpdateOrderOpts {
    return {
      status: order.status ? { status: order.status.status} : null,
      company: removeEmpty(order.company, true, true, true),
      contacts: removeEmpty(order.contacts, true, true, true),
      VAT_ID: order.VAT_ID,
      currency: ensureNotEmpty(order.currency),
      contractNo: ensureNotEmpty(order.contractNo),
      discount: ensureNotEmptyObject(order.discount),
      deliveryFirst: isNil(order.deliveryFirst) ? null : order.deliveryFirst,
      orderItems: removeEmpty(order.orderItems, true, true, true),
      orderTitle: ensureNotEmpty(order.orderTitle),
      note: ensureNotEmpty(order.note),
      orderTitleSK: ensureNotEmpty(order.orderTitleSK),
      payment: this.sanitizePayment(order.payment),
      purchaseOrderNo: ensureNotEmpty(order.purchaseOrderNo),
      phone: ensureNotEmpty(order.phone),
      freeText: ensureNotEmpty(order.freeText)
    };
  }

  private sanitizePayment(payment: OrderPayment): OrderPayment {
    if (payment.paymentDate) {
      payment.paymentDate = new Date(payment.paymentDate).getTime();
    }
    return removeEmpty(payment, true);
  }
}
