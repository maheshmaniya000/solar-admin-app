import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User, Company } from '@solargis/types/user-company';

import { Config } from '../../../config';
import { SettingsDateTimeFormat, SettingsTranslateLang } from '../../../core/actions/settings.actions';
import { availableLanguages, availableDateFormats } from '../../../core/models';
import { DateFormat, Language, TranslateSettings } from '../../../core/types';
import { State } from '../../../user/reducers';


@Component({
  selector: 'sg-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit {

  @Input() user: User;
  @Input() company: Company;

  @Output() onChangePassword = new EventEmitter();
  @Output() onUnselectCompany = new EventEmitter();
  @Output() onChangeUnitToggles = new EventEmitter();

  languages: Language[];
  currentLanguage$: Observable<Language>;
  availableDateFormats: DateFormat[] = availableDateFormats;
  currentDateFormat$: Observable<DateFormat>;
  now = Date.now();

  constructor(
    private readonly store: Store<State>,
    private readonly config: Config,
  ) { }

  ngOnInit(): void {
    this.languages = availableLanguages.filter(lang => !this.config.languages || this.config.languages.includes(lang.lang));

    this.currentLanguage$ = this.store.select('settings', 'translate')
      .pipe(
        map((translate: TranslateSettings) => translate.lang),
        map(lang => this.languages.find(l => l.lang === lang))
      );

    this.currentDateFormat$ = this.store.select('settings', 'dateTimeFormat').pipe(
      map(savedFormat => this.availableDateFormats.filter(format => savedFormat.dateFormat === format.format)[0]),
    );
  }

  changeLang(lang: string): void {
    this.store.dispatch(new SettingsTranslateLang(lang));
  }

  changeDateFormat(format: string): void {
    this.store.dispatch(new SettingsDateTimeFormat({dateFormat: format, timeFormat: 'HH:mm:ss'}));
  }
}
