import { ChangeDetectorRef, Component, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';

import { Company } from '@solargis/types/user-company';
import { isEmpty, removeEmpty } from '@solargis/types/utils';

import { ErrorMessageConfigs } from 'components/form-error/append-form-error/models/error-message-configs.model';
import { companyRefToString } from 'ng-shared/shared/utils/company.utils';
import { listSelectionValidator } from 'ng-shared/user/utils/list-selection.validator';

import { AdminUsersCompaniesService } from '../../services/admin-users-companies.service';

// Based on https://inglkruiz.github.io/angular-material-reusable-autocomplete/
@Component({
  selector: 'sg-admin-company-autocomplete',
  templateUrl: './company-autocomplete.component.html',
  styleUrls: ['./company-autocomplete.component.scss']
})
export class CompanyAutocompleteComponent implements OnInit, ControlValueAccessor {
  private static readonly searchTriggerLength = 0;
  readonly companyRefToString = companyRefToString;
  readonly notSelectedFromListCustomError: ErrorMessageConfigs = {
    notSelectedFromList: { priority: 60, translationKey: 'Select a company from the list' }
  };

  @Input() hint: string;
  @Input() placeholder = 'Find company';

  inputControl = new FormControl('', { validators: [Validators.required, listSelectionValidator] });
  status: 'searching' | 'done' | 'noResults' = 'done';
  companies: Company[];
  onTouched: any;

  constructor(
    @Self() readonly ngControl: NgControl,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService
  ) {
    this.ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    const control = this.ngControl.control;
    control.setValidators(Validators.compose([this.inputControl.validator, control.validator]));
    control.updateValueAndValidity({ emitEvent: false });
  }

  writeValue(obj: any): void {
    this.inputControl.setValue(obj ? obj : null);
  }

  registerOnChange(fn: any): void {
    this.inputControl.valueChanges.pipe(debounceTime(300)).subscribe({
      next: value => {
        if (typeof value === 'string') {
          if (this.isMinLength(value)) {
            this.status = 'searching';
            this.filterCompanies(value);
          } else {
            this.status = 'done';
          }
          fn(null);
        } else {
          fn(value);
        }
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable() : this.inputControl.enable();
  }

  isMinLength(value: string): boolean {
    return value.length >= CompanyAutocompleteComponent.searchTriggerLength;
  }

  onBlur(): void {
    this.onTouched();
  }

  private filterCompanies(searchString?: string): void {
    this.adminUsersCompaniesService
      .getCompanies(removeEmpty({ searchString, nonHistoric: true, hasNoParent: false }), { size: 10, index: 0 })
      .pipe(map(companies => companies.data))
      .subscribe(companies => {
        this.status = isEmpty(companies) ? 'noResults' : 'done';
        this.companies = companies;
        this.changeDetectorRef.detectChanges();
      });
  }
}
