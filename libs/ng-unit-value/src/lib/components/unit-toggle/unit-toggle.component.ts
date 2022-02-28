import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslationDef } from '@solargis/types/translation';
import { isFunction } from '@solargis/types/utils';
import { UnitToggle, UnitToggleSettings } from '@solargis/units';

import { UnitToggleService } from '../../services/unit-toggle.service';

@Component({
  selector: 'sg-unit-toggle',
  styles: ['mat-select { height:auto; padding-top: 8px; width: inherit; }'],
  template: `
    <mat-select (selectionChange)="dispatchToggle($event.value)" [(value)]="currentToggleKey">
      <mat-select-trigger>
        <span [sgTranslation]="getTranslationKey(currentToggleKey ?? '')"></span>
      </mat-select-trigger>

      <mat-option value="{{ this.toggleKeys.default }}">
        <span [sgTranslation]="getTranslationKey(this.toggleKeys.default)"></span>
      </mat-option>
      <mat-option value="{{ this.toggleKeys.alternate }}">
        <span [sgTranslation]="getTranslationKey(this.toggleKeys.alternate)"></span>
      </mat-option>
    </mat-select>
  `
})
export class UnitToggleComponent implements OnInit, OnDestroy {
  @Input() toggle!: UnitToggle;
  @Input() passive!: boolean;

  @Output() onKeyChange: EventEmitter<string> = new EventEmitter<string>();

  currentToggleKey: string | undefined;
  toggleKeys: any;

  subscription!: Subscription;

  constructor(@Inject(UnitToggleService) private readonly service: UnitToggleService) {}

  ngOnInit(): void {
    const toggle = this.toggle;

    this.toggleKeys = {
      default: this.toggle.defaultUnit,
      alternate: Object.keys(this.toggle.units).find(key => key !== this.toggle.defaultUnit)
    };

    // selecting single settingKey from settings - for current toggle only
    this.subscription = this.service.selectUnitToggle()
      .pipe(map((ts: UnitToggleSettings) => ts[toggle.settingsKey] || toggle.defaultUnit))
      .subscribe(toggleUnit => this.currentToggleKey = toggleUnit);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getTranslationKey(toggleKey: string): string | TranslationDef {
    const { label, html } = this.toggle.units[toggleKey];
    if (label) {return label;}
    else if (html && !isFunction(html)) {return html as TranslationDef;}
    else {return toggleKey;}
  }

  dispatchToggle(toggleKey: string): void {
    if (!this.passive) {
      this.service.dispatchUnitToggle([{
        settingsKey: this.toggle.settingsKey,
        toggleKey
      }]);
    }
    this.onKeyChange.emit(toggleKey);
  }

}
