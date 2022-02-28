import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { isEqual } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { toggleKeysCombinations, Unit, UnitToggleSettings } from '@solargis/units';

import { UnitToggleService } from '../../services/unit-toggle.service';
import { getToggleHtml$, getToggleKeys$, resolveHtml$ } from '../../utils';

type ToggleVariant = {
  html: string;
  toggleKeys: string[];
};

@Component({
  selector: 'sg-unit-toggle-label',
  styleUrls: ['./unit-toggle-label.component.scss'],
  templateUrl: './unit-toggle-label.component.html'
})
export class UnitToggleLabelComponent implements OnInit, OnChanges {

  @Input() unit!: Unit;

  private readonly unitToggle$: Observable<UnitToggleSettings>;

  unitHtml$!: Observable<string>;
  toggleVariants$!: Observable<ToggleVariant[]>;
  currentToggleKeys$!: Observable<string[]>;

  constructor(@Inject(UnitToggleService) private readonly service: UnitToggleService, private readonly transloco: TranslocoService) {
    this.unitToggle$ = this.service.selectUnitToggle();
  }

  ngOnInit(): void {
    this.toggle();
  }

  equalsToggleKeys(toggleKeys: string[], currentToggleKeys: any): boolean {
    return isEqual(toggleKeys, currentToggleKeys);
  }

  toggleUnit(toggleKeys: string[]): void {
    const togglePayload = this.unit.settingsKeys.map(
      (settingsKey: string, i: number) => ({ settingsKey, toggleKey: toggleKeys[i] })
    );
    this.service.dispatchUnitToggle(togglePayload);
  }

  toggle(): void {
    this.unitHtml$ = resolveHtml$(this.unit, this.unitToggle$, this.transloco);

    if (this.unit.toggle) {
      const combinations = toggleKeysCombinations(this.unit);

      const toggleHtmls$ = combinations.map(toggleKeys =>
        getToggleHtml$(this.unit, this.transloco, toggleKeys).pipe(
          map(html => ({ html, toggleKeys }))
        ));

      this.toggleVariants$ = combineLatest(toggleHtmls$);
      this.currentToggleKeys$ = getToggleKeys$(this.unit, this.unitToggle$);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unit) {
      this.toggle();
    }
  }
}
