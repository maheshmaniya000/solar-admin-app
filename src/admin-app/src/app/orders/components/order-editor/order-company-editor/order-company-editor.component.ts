import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators';

import { getInvoiceCompanyRegion, InvoiceCompanyRegion, isEUCompany } from '@solargis/types/customer';
import { Company, companyToCompanySnapshot } from '@solargis/types/user-company';

import { DetailNavigationService } from '../../../../shared/services/detail-navigation.service';
import { OrderDetailStore, OrderViewModel } from '../../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-company-editor',
  templateUrl: './order-company-editor.component.html',
  styleUrls: ['./order-company-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCompanyEditorComponent implements OnInit {
  @Input() parentForm: FormGroup;

  viewModel$: Observable<OrderViewModel & { expandSnapshotDisabled: boolean; snapshotEditorHidden: boolean }>;

  constructor(readonly orderDetailStore: OrderDetailStore, readonly detailNavigationService: DetailNavigationService) {}

  ngOnInit(): void {
    const localViewModel$ = this.orderDetailStore.viewModel$.pipe(
      map(({ editingCompanySnapshot }) => editingCompanySnapshot),
      distinctUntilChanged(),
      map(editingCompanySnapshot => {
        const companyFormGroupInvalid = this.getCompanyFormGroup().invalid;
        return {
          expandSnapshotDisabled: editingCompanySnapshot && companyFormGroupInvalid,
          snapshotEditorHidden: !editingCompanySnapshot && !companyFormGroupInvalid
        };
      })
    );
    this.viewModel$ = this.orderDetailStore.viewModel$.pipe(
      withLatestFrom(localViewModel$),
      map(([viewModel, localViewModel]) => ({ ...viewModel, ...localViewModel }))
    );
  }

  getCompanyFormGroup(): FormGroup {
    return this.parentForm.get('company') as FormGroup;
  }

  getSgCompanyIdFormControl(): AbstractControl {
    return this.parentForm.get('sgCompanyId');
  }

  onClearCompanyButtonClick(): void {
    this.orderDetailStore.setCompany(undefined);
    this.getSgCompanyIdFormControl().reset();
    (this.parentForm.get('contacts') as FormArray).clear();
  }

  onCompanySelected(company: Company): void {
    if(!company) {
      return;
    }
    const countryRegion = getInvoiceCompanyRegion(company);
    if (countryRegion === InvoiceCompanyRegion.SK) {
      this.parentForm.patchValue({ VAT: 20 });
    } else if (isEUCompany(company)) {
      this.parentForm.patchValue({ VAT: null });
    }
    this.orderDetailStore.setCompany(company);
    this.parentForm.patchValue({ sgCompanyId: company.sgCompanyId });
  }

  onCopyActualToSnapshotClick(company: Company): void {
    this.parentForm.patchValue({ company: companyToCompanySnapshot(company) });
    this.orderDetailStore.setEditingCompanySnapshot(true);
  }
}
