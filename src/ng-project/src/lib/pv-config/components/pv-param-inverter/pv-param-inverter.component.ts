import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  Inverter,
  InverterType,
  PvConfigType,
  inverterTypeEfficiency,
  supportedInverterTypesMap,
  getInverterEfficiency
} from '@solargis/types/pv-config';

@Component({
  selector: 'sg-pv-param-inverter',
  templateUrl: './pv-param-inverter.component.html',
  styleUrls: ['./pv-param-inverter.component.scss']
})
export class PvParamInverterComponent implements OnInit {
  inverterTypeEfficiency = inverterTypeEfficiency;
  getInverterEfficiency = getInverterEfficiency;

  supportedInverterTypes: InverterType[];
  form: FormGroup;

  @Input() pvConfigType: PvConfigType;
  @Input() params: Inverter;

  @Output() onChange: EventEmitter<Inverter> = new EventEmitter<Inverter>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  get customEfficiency(): AbstractControl | null { return this.form.get('customEfficiency'); }

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      customEfficiency: [undefined, [ ]],
    });

    this.supportedInverterTypes = supportedInverterTypesMap[this.pvConfigType];

    this.customEfficiency.setValue(this.params.customEfficiency);
    this.presetCustomEfficiency();
  }

  setType(inverter: InverterType): void {
    this.presetCustomEfficiency(inverter);
    this.isValid.next(this.isCustom(inverter) ? this.form.valid : true);
    this.onChange.next({ inverter, customEfficiency: this.customEfficiency.value });
  }

  presetCustomEfficiency(inverter: InverterType = this.params.inverter): void {
    if (this.isCustom(inverter)) {
      this.customEfficiency.enable();
      this.customEfficiency.setValidators([ Validators.required, Validators.min(80), Validators.max(100) ]);
    } else {
      this.customEfficiency.disable();
      this.customEfficiency.setValue(this.inverterTypeEfficiency[inverter]);
    }
    this.customEfficiency.updateValueAndValidity();
  }

  isCustom = (type: InverterType): boolean => type === InverterType.Custom;

}
