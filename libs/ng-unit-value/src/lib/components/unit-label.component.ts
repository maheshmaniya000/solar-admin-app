import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

import { Unit } from '@solargis/units';

import { UnitToggleService } from '../services/unit-toggle.service';
import { resolveHtml$ } from '../utils';

@Component({
  selector: 'sg-unit-label',
  template: '<span [innerHtml]="unitHtml$ | async"></span>'
})
export class UnitLabelComponent implements OnInit, OnChanges {

  @Input() unit!: Unit;

  unitHtml$!: Observable<string>;

  constructor(@Inject(UnitToggleService) private readonly service: UnitToggleService, private readonly transloco: TranslocoService) {
  }

  ngOnInit(): void {
    this.unitHtml$ = resolveHtml$(this.unit, this.service.selectUnitToggle(), this.transloco);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unit) {
      this.unitHtml$ = resolveHtml$(this.unit, this.service.selectUnitToggle(), this.transloco);
    }
  }

}
