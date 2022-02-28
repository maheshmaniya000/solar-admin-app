import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { sortBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, publishReplay, refCount, switchMap, tap } from 'rxjs/operators';

import { isEUCountry } from '@solargis/types/customer';
import { Company, Country, State } from '@solargis/types/user-company';

import { SgValidators } from 'components/validators/validators';
import { filterByName } from 'ng-shared/shared/utils/filter.utils';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { CompanyService } from '../../../user/services/company.service';
import { listSelectionValidator, notSelectedFromListCustomErrors } from '../../../user/utils/list-selection.validator';

@Component({
  selector: 'sg-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent extends SubscriptionAutoCloseComponent implements OnInit {
  readonly notSelectedFromListCustomErrors = notSelectedFromListCustomErrors;

  /**
   * Initial values in form. Default: empty
   * If no values are provided, form is added "Accept Solargis conditions" box
   */
  @Input() initValues: Company;

  /**
   * Allow checking for similar company
   */
  @Input() checkSimilarCompany = true;

  /**
   * Emits company edited values or null if invalid
   */
  @Output() company = new EventEmitter<Company>();

  companyForm: FormGroup;
  get name(): AbstractControl { return this.companyForm.get('name'); }
  get country(): AbstractControl { return this.companyForm.get('country'); }
  get state(): AbstractControl { return this.companyForm.get('state'); }
  get phone(): AbstractControl { return this.companyForm.get('phone'); }
  get VAT(): AbstractControl { return this.companyForm.get('VAT'); }

  countries$: Observable<Country[]>;
  filteredCountries: Country[] = [];
  filteredStates: State[] = [];

  similarCompanyExists$ = new BehaviorSubject<boolean>(false);
  vatCheckInProgress = false;
  isEUCountry = false;

  constructor(private readonly fb: FormBuilder, private readonly companyService: CompanyService) {
    super();
  }

  ngOnInit(): void {
    this.companyForm  = this.fb.group({
      name: [undefined, [Validators.required]],
      phone: [undefined, [Validators.required, SgValidators.phoneNumber]],
      city: [undefined, [Validators.required]],
      street: [undefined, []],
      zipCode: [undefined, []],
      country: [undefined, [Validators.required, listSelectionValidator]],
      state: [undefined,],
      VAT: [undefined,],
    });

    this.countries$ = this.companyService.listCountries().pipe(
      map(countries => sortBy(countries, ({ name }) => name)),
      publishReplay(),
      refCount(),
      // init country list (before user start typing to input)
      tap(countries => this.filteredCountries = countries)
    );

    // filter for companies
    this.addSubscription(
      combineLatest([this.country.valueChanges, this.countries$]).subscribe(([countryFilter, countries]) =>
        this.filteredCountries = filterByName(countries, countryFilter)
      )
    );

    // filter for states
    this.addSubscription(
      this.state.valueChanges.subscribe(stateFilter => {
        const countryValue = this.country.value as Country;
        if (countryValue) {
          this.filteredStates = sortBy(filterByName(countryValue.states || [], stateFilter), ({ name }) => name);
        }
      })
    );

    // control of required state at any time
    this.addSubscription(
      this.country.valueChanges.subscribe(country => {
        this.state.reset();
        if (country?.states?.length > 0) {
          this.state.setValidators([Validators.required, listSelectionValidator]);
          this.state.updateValueAndValidity();
        }
      })
    );

    // name has changed (call company validation function)
    this.addSubscription(
      this.name.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(validationResponse => {
          this.similarCompanyExists$.next(false);
          this.similarCompanyExists$.next(this.checkSimilarCompany && validationResponse.similarExists);
        })
    );

    // VAT has changed (call company validation function)
    this.addSubscription(
      this.VAT.valueChanges.pipe(
        filter(() => this.isEUCountry),
        // FIXME use real async validator instead -> https://solargis.atlassian.net/browse/SG2-5871
        // FAKE error until validation finishes
        tap(() => this.VAT.setErrors({ pending: true })),
        debounceTime(500),
        switchMap(newVatId => {
          // company VAT validation will be done
          this.vatCheckInProgress = true;
          return newVatId?.length > 2 && this.country.value
            ? this.companyService.validateVatId(this.country.value, newVatId)
            : of(false);
        })
      ).subscribe(valid => {
        this.vatCheckInProgress = false;
        this.VAT.setErrors(valid ? null : { incorrect: true });
      }, () => {
        // TODO: handle rxjs error - not validated
      })
    );

    // output values
    this.addSubscription(
      this.companyForm.statusChanges.subscribe(() => {
        this.company.emit(this.companyForm.valid ? this.companyForm.value : null);
      })
    );

    // set init values
    // use patch, so no error is thrown on incorrect values
    if (this.initValues) {
      this.companyForm.patchValue(this.initValues);
      this.isEUCountry = isEUCountry(this.initValues.country);
      this.countries$.pipe(first()).subscribe(countries => {
        if (this.initValues.country) {
          this.country.setValue(countries.find(({ code }) => code === this.initValues.country.code));
        }
      });
      Object.keys(this.companyForm.controls).forEach(key => {
        this.companyForm.controls[key].markAsTouched();
      });
    }
  }

  /**
   * User choose from autocomplete country or state
   *
   * @param selectedEvent
   */
  selectCountry(selectedEvent: MatAutocompleteSelectedEvent): void {
    if (selectedEvent && selectedEvent.option.value) {
      const country = selectedEvent.option.value as Country;
      this.isEUCountry = isEUCountry(country);
      // reset VAT, if country is from EU -> EU VAT validation is required (set to TRUE)
      this.companyForm.patchValue({ VAT: null });
      if (!this.isEUCountry) {
        this.VAT.clearValidators();
        this.VAT.updateValueAndValidity();
      }
      if (country.states?.length > 0) {
        // country has states, set states + set to required
        this.filteredStates = sortBy(country.states, ({ name }) => name);
        this.state.setValidators([Validators.required, listSelectionValidator]);
      } else {
        // country has no states, remove validator + clear state
        this.state.clearValidators();
        this.companyForm.patchValue({ state: null });
      }
    }
  }

  /**
   * User choose from autocomplete country or state -> what should be displayed ?
   *
   * @param country
   */
  countryStateDisplayFn(country?: Country | State): string | undefined {
    return country ? country.name : null;
  }
}
