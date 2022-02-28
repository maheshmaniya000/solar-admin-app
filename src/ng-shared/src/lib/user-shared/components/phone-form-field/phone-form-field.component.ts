import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sortBy } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { map, publishReplay, refCount, startWith } from 'rxjs/operators';

import { Country } from '@solargis/types/user-company';

import { ErrorMessageConfigs } from 'components/form-error/append-form-error/models/error-message-configs.model';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { CompanyService } from '../../../user/services/company.service';
import { phoneCodeValidator } from '../../../user/utils/phone.validator';

@Component({
  selector: 'sg-phone-form-field',
  templateUrl: './phone-form-field.component.html',
  styles: ['.margin-top { margin-top: 24px; }'],
})
export class PhoneFormFieldComponent extends SubscriptionAutoCloseComponent implements OnInit {
  readonly phoneCodeCustomErrors: ErrorMessageConfigs = {
    phoneCodeIsString: { priority: 60, translationKey: 'user.company.phoneCodeIsString' }
  };
  phoneCountries$: Observable<Country[]>;
  form: FormGroup;

  @Input() phoneCode: string | Country;
  @Input() phone: string;
  @Input() trial = false;
  @Input() required = false;

  @Output() phoneCodeChange: EventEmitter<string | Country> = new EventEmitter();
  @Output() phoneChange: EventEmitter<string> = new EventEmitter();

  get phoneCodeField(): AbstractControl | null { return this.form.get('phoneCode'); }
  get phoneField(): AbstractControl | null { return this.form.get('phone'); }

  constructor(private readonly fb: FormBuilder, private readonly companyService: CompanyService) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      phoneCode: [this.phoneCode || null, this.required ? [Validators.required, phoneCodeValidator] : [phoneCodeValidator]],
      phone: [this.phone || null, this.required ? [Validators.required] : []],
    });

    const countries$ = this.companyService.listCountries().pipe(
      publishReplay(),
      refCount(),
      map(countries => countries.filter(c => c.callingCode && c.callingCode !== 'NULL')),
      map(countries => sortBy(countries, ({ name }) => name))
    );

    this.phoneCountries$ = combineLatest([this.phoneCodeField.valueChanges.pipe(startWith('')), countries$]).pipe(
        map(([partOfCountry, countries]) => {
          if (!partOfCountry || typeof partOfCountry !== 'string') {return countries;}
          return this.parseCountries(countries, partOfCountry);
        })
      );

    this.addSubscription(
      this.phoneCodeField.valueChanges.subscribe(val => this.phoneCodeChange.emit(val))
    );
    this.addSubscription(
      this.phoneField.valueChanges.subscribe(val => this.phoneChange.emit(val))
    );
  }

  private readonly parseCountries = (countries: Country[], partOfCountry: string): Country[] => {
    partOfCountry = partOfCountry.toLowerCase();
    return countries.filter(c =>
      c.name.toLowerCase().includes(partOfCountry) || c.callingCode.toLowerCase().includes(partOfCountry)
    );
  };

  phoneDisplayFn = (country?: Country): string | undefined => country ? `${country.callingCode} ${country.name}` : null;
}
