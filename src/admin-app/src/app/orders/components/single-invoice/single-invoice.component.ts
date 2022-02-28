import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, first, map, switchMap } from 'rxjs/operators';

import {
  CreateInvoiceInput,
  getFinalInvoice,
  getInvoice,
  getInvoiceAccountingPeriodDate,
  InvoiceHintResponse,
  InvoiceType,
  isEUCompany,
  Order
} from '@solargis/types/customer';
import { CompanySnapshot, UserRef } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { UserState } from 'ng-shared/user/types';

import { AdminInvoicesService } from '../../../shared/services/admin-invoices.service';
import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../../store';

@Component({
  selector: 'sg-admin-single-invoice',
  templateUrl: './single-invoice.component.html',
  styleUrls: [
    '../../shared-order-styles.scss',
    './single-invoice.component.scss'
  ]
})
export class SingleInvoiceComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @Input() company: CompanySnapshot;
  @Input() order: Order;
  @Input() working: boolean;

  @Output() saveOutput = new EventEmitter<[CreateInvoiceInput, string]>();

  invoiceHint: InvoiceHintResponse;
  invoiceHintInProgress = false;

  form: FormGroup;

  author: UserRef;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly store: Store<fromAdmin.State>,
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly datePipe: DatePipe,
    private readonly dialog: MatDialog,
    private readonly invoiceService: AdminInvoicesService,
  ) {
    super();
  }

  ngOnInit(): void {
    const type = this.setDefaultType();

    this.form = this.fb.group({
      type: [type, [Validators.required]],
      issueDate: [null, []],
      dueDate: [null, []],
      deliveryDate: [this.order.orderItemsProcessed ? new Date(this.order.orderItemsProcessed) : null, []],
      paymentDate: [this.order.payment.paymentDate ? new Date(this.order.payment.paymentDate) : null, []],
    });

    this.setEnabledDatesForInvoiceType(type);

    this.store.select('user', 'user').pipe(first()).subscribe((user: UserState) => {
      this.author = user;
    });
    // change of INVOICE TYPE can change validation requirements for DATEs
    this.addSubscription(
      this.form.controls.type.valueChanges.subscribe(
        invoiceType => this.setEnabledDatesForInvoiceType(invoiceType)
      )
    );
    this.form.controls.issueDate.valueChanges.pipe(
      filter(newIssueDate => newIssueDate && (this.form.controls.type.value !== InvoiceType.INVOICE_FOR_PROFA))
    ).subscribe((issueDate: Date) => {
      this.form.patchValue({
        dueDate: new Date(new Date(issueDate).getTime() + (1000 * 60 * 60 * 24 * 14))
      });
    });
    this.markFormGroupTouched(this.form);

    this.form.valueChanges.pipe(
      debounceTime(100),
      map(values => ({
        type: values.type,
        currency: this.order.currency,
        issueDate: this.getISOOnlyDate(values.issueDate),
        deliveryDate: this.getISOOnlyDate(values.deliveryDate),
      })),
      distinctUntilChanged(isEqual),
      switchMap(values => {
        const date = getInvoiceAccountingPeriodDate(values);
        if (!date) {
          return of(null);
        } else {
          this.invoiceHintInProgress = true;
          return this.invoiceService.getInvoiceHint(this.order.sgOrderId, values.type, date, values.currency);
        }
      })
    ).subscribe(result => {
      this.invoiceHint = result;
      this.invoiceHintInProgress = false;
      this.changeDetectorRef.markForCheck();
    });

    this.setDefaultType();
  }

  setDefaultType(): InvoiceType {
    let type: InvoiceType = InvoiceType.CN;

    if (!this.order.deliveryFirst && this.hasProForma()) {
      type = InvoiceType.INVOICE_FOR_PROFA;
    } else if (this.order.deliveryFirst || typeof this.order.deliveryFirst === 'undefined') {
      type = InvoiceType.INVOICE;
    } else if (this.hasInvoice() || this.hasProFormaInvoice()) {
      type = InvoiceType.CN;
    } else if (!this.order.deliveryFirst || typeof this.order.deliveryFirst === 'undefined') {
      type = InvoiceType.PROFA;
    }

    if (this.form) {
      this.form.controls.type.setValue(type);
    }

    return type;
  }

  setEnabledDatesForInvoiceType(typeChange: InvoiceType): void {
    switch (typeChange) {
      case InvoiceType.INVOICE: this.setDatesValidity([true, true, true, false]); break;
      case InvoiceType.PROFA: this.setDatesValidity([true, true, false, false]); break;
      case InvoiceType.INVOICE_FOR_PROFA: this.setDatesValidity([true, false, true, true]); break;
      case InvoiceType.CN: this.setDatesValidity([true, true, true, false]); break;
    }
    this.markFormGroupTouched(this.form);
  }

  hasProForma(): boolean {
    return !!getInvoice(this.order, InvoiceType.PROFA);
  }

  hasProFormaInvoice(): boolean {
    return !!getInvoice(this.order, InvoiceType.INVOICE_FOR_PROFA);
  }

  hasInvoice(): boolean {
    return !!getInvoice(this.order, InvoiceType.INVOICE);
  }

  hasCN(): boolean {
    return !!getInvoice(this.order, InvoiceType.CN);
  }

  getInvoiceLabel(): string {
    switch (this.form.value.type) {
      case InvoiceType.PROFA: return 'proforma';
      case InvoiceType.CN: return 'credit note';
      default: return 'invoice';
    }
  }

  save(): void {
    this.working = true;
    this.adminUsersCompaniesService.getCompany(this.company.sgCompanyId)
      .pipe(
        switchMap(company => {
          if (company.VAT_ID && company.country.code) {
            if (!isEUCompany(company)) {
              return this.openFailViesValidationDialog('Country is not in EU');
            }
            return this.companyService.validateVatId(company, company.VAT_ID).pipe(
              switchMap(vatValidation => {
                if (!vatValidation) {
                  return this.openFailViesValidationDialog('VAT ID is not valid');
                }
                return of([true, true]) as Observable<[boolean, boolean]>;
              }),
              catchError(() => this.openFailViesValidationDialog('Service unavailable')),
            );
          } else {
            return of([false, true]);
          }
        }))
      .subscribe(([viesValidationStatus, shouldContinue]) => {
        this.working = false;
        if (shouldContinue) {
          const values = this.form.value;

          const result: CreateInvoiceInput = removeEmpty({
            type: values.type,
            deliveryDate: this.getISOOnlyDate(values.deliveryDate),
            issueDate: this.getISOOnlyDate(values.issueDate),
            dueDate: this.getISOOnlyDate(values.dueDate),
            paymentDate: this.getISOOnlyDate(values.paymentDate),
            viesValidationStatus
          });

          let invoiceCodeToUpdate = null;
          const invoiceToCN = getFinalInvoice(this.order);
          const profa = this.order.invoices?.find(i => i.type === InvoiceType.PROFA);

          // we can swap between INVOICE and INVOICE_FOR_PROFA
          if ((result.type === InvoiceType.INVOICE || result.type === InvoiceType.INVOICE_FOR_PROFA) && invoiceToCN) {
            invoiceCodeToUpdate = invoiceToCN.invoiceCode;
          }
          if (result.type === InvoiceType.CN && !invoiceToCN) {
            invoiceCodeToUpdate = this.order.invoices?.find(i => i.type === InvoiceType.CN)?.invoiceCode;
          }
          if (result.type === InvoiceType.PROFA && profa) {
            invoiceCodeToUpdate = profa.invoiceCode;
          }

          this.saveOutput.emit([result, invoiceCodeToUpdate]);
        }
      });
  }

  private openFailViesValidationDialog(message: string): Observable<[boolean, boolean]> {
    return this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'VIES verification not successful',
        text: message,
        action: 'Generate anyway',
      }
    }).afterClosed().pipe(
      map(res => [false, res])
    );
  }


  /**
   * Set validity, required validator and value for dates (issue, due, delivery)
   */
  private setDatesValidity(required: boolean[]): void {
    const dates = ['issueDate', 'dueDate', 'deliveryDate', 'paymentDate'];

    dates.forEach((item, index) => {
      if (required[index]) {
        this.form.controls[item].setValidators(Validators.required);
        this.form.controls[item].enable({});
      } else {
        this.form.controls[item].setValidators([]);
        this.form.controls[item].disable({});
      }
    });
  }

  /**
   * Iterate over all form controls and make them touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getISOOnlyDate(date: Date | string): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

}
