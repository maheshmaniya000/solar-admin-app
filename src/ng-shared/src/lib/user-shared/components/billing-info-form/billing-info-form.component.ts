import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { sortBy } from 'lodash-es';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, map, publishReplay, refCount, switchMap, tap } from 'rxjs/operators';

import { isEUCountry } from '@solargis/types/customer';
import { Country, State } from '@solargis/types/user-company';

import { filterByName } from 'ng-shared/shared/utils/filter.utils';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { CompanyService } from '../../../user/services/company.service';
import { listSelectionValidator, notSelectedFromListCustomErrors } from '../../../user/utils/list-selection.validator';
import { phoneCodeValidator } from '../../../user/utils/phone.validator';
import { BillingForm } from '../../types';

// FIXME copy-paste from company-form.component
@Component({
  selector: 'sg-billing-info-form',
  templateUrl: './billing-info-form.component.html'
})
export class BillingInfoFormComponent extends SubscriptionAutoCloseComponent implements OnInit {
  readonly notSelectedFromListCustomErrors = notSelectedFromListCustomErrors;
  form: FormGroup;

  countries$: Observable<Country[]>;
  filteredCountries: Country[] = [];
  filteredStates: State[] = [];

  vatCheckInProgress = false;
  isEUCountry = false;

  @Input() name: string;

  @Output() output: EventEmitter<BillingForm> = new EventEmitter();

  get country(): AbstractControl { return this.form.get('country'); }
  get state(): AbstractControl { return this.form.get('state'); }
  get VAT(): AbstractControl { return this.form.get('VAT'); }
  get phoneCode(): AbstractControl { return this.form.get('phoneCode'); }
  get phone(): AbstractControl { return this.form.get('phone'); }

  constructor(private readonly fb: FormBuilder, private readonly companyService: CompanyService) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [{ value: this.name, disabled: true }, []],
      street: [undefined, []],
      city: [undefined, [Validators.required]],
      zipCode: [undefined, []],
      country: [undefined, [Validators.required, listSelectionValidator]],
      state: [undefined, []],
      phoneCode: [undefined, [Validators.required, phoneCodeValidator]],
      phone: [undefined, [Validators.required]],
      VAT: [undefined, []]
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

    // VAT has changed (call company validation function)
    // FIXME copy-paste from company-form.component
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

    this.addSubscription(
      this.form.statusChanges.subscribe(() => {
        this.output.emit(this.form.valid ? this.form.value : null);
      })
    );
  }

  /**
   * User choose from autocomplete country or state
   *
   * @param selectedEvent
   */
  selectCountry(selectedEvent: MatAutocompleteSelectedEvent): void {
    if (selectedEvent && selectedEvent.option.value) {
      const country = (selectedEvent.option.value as Country);
      this.isEUCountry = isEUCountry(country);
      // reset VAT, if country is from EU -> EU VAT validation is required (set to TRUE)
      this.form.patchValue({ VAT: null });

      if (country.states?.length > 0) {
        // country has states, set states + set to required
        this.filteredStates = sortBy(country.states, ({ name }) => name);
        this.state.setValidators([Validators.required, listSelectionValidator]);
      } else {
        // country has no states, remove validator + clear state
        this.state.clearValidators();
        this.form.patchValue({ state: null });
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
