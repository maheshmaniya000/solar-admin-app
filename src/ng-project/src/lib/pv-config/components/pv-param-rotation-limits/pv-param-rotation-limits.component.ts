import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';

import { Project } from '@solargis/types/project';
import { validate, RotationLimits, DefaultRotationLimitEast, DefaultRotationLimitWest } from '@solargis/types/pv-config';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';


@Component({
  selector: 'sg-pv-param-rotation-limits',
  templateUrl: './pv-param-rotation-limits.component.html',
  styleUrls: ['./pv-param-rotation-limits.component.scss'],
})
export class PvParamRotationLimitsComponent extends SubscriptionAutoCloseComponent implements OnInit {
  MIN_EAST = -90;
  MAX_EAST = 0;

  MIN_WEST = 0;
  MAX_WEST = 90;

  @Input() params: RotationLimits;
  @Input() project: Project;
  @Input() expanded: boolean;

  @Output() onChange: EventEmitter<RotationLimits> = new EventEmitter<RotationLimits>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: FormGroup;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
    // create form
      west: new FormControl(this.params.west, [
        Validators.required, Validators.min(this.MIN_WEST), Validators.max(this.MAX_WEST)
      ]),
      east: new FormControl(this.params.east, [
        Validators.required, Validators.min(this.MIN_EAST), Validators.max(this.MAX_EAST)
      ]),
    });

    // propagate changes
    this.addSubscription(
      this.form.valueChanges
        .pipe(
          filter(() => this.form.valid),
          debounceTime(50)
        )
        .subscribe(change => {
          const params: RotationLimits = {
            west: validate(change.west, this.MIN_WEST, this.MAX_WEST),
            east: validate(change.east, this.MIN_EAST, this.MAX_EAST),
          };

          this.onChange.next(params);
        })
    );

    this.addSubscription(
      this.form.statusChanges.subscribe(change => this.isValid.next(change === 'VALID'))
    );
  }

  setDefaults(): void {
    this.form.controls.west.setValue(DefaultRotationLimitWest);
    this.form.controls.east.setValue(DefaultRotationLimitEast);
  }

}
