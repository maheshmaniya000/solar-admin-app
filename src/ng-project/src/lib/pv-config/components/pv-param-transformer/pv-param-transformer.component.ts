import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  PvConfigType,
  Transformer,
  TransformerType,
  transformerTypeLoss,
  getTransformerLoss
} from '@solargis/types/pv-config';

@Component({
  selector: 'sg-pv-param-transformer',
  templateUrl: './pv-param-transformer.component.html',
  styleUrls: ['./pv-param-transformer.component.scss']
})
export class PvParamTransformerComponent implements OnInit {
  transformerTypeLoss = transformerTypeLoss;
  getTransformerLoss = getTransformerLoss;

  @Input() params: Transformer;
  @Input() pvConfigType: PvConfigType;

  @Output() onChange: EventEmitter<Transformer> = new EventEmitter<Transformer>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  transformerTypes: TransformerType[];
  form: FormGroup;

  get customLoss(): AbstractControl | null { return this.form.get('customLoss'); }

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      customLoss: [undefined, [ ]],
    });

    if (this.pvConfigType === PvConfigType.RooftopSmall) {
      this.transformerTypes = [
        TransformerType.None, TransformerType.Custom
      ];
    } else if (this.pvConfigType === PvConfigType.GroundFixed) {
      this.transformerTypes = [
        TransformerType.Standard, TransformerType.HighEfficiency, TransformerType.Custom
      ];
    } else {
      this.transformerTypes = [
        TransformerType.Standard, TransformerType.HighEfficiency,
        TransformerType.None, TransformerType.Custom
      ];
    }

    this.customLoss.setValue(this.params.customLoss);
    this.presetCustomLoss();
  }

  setType(type: TransformerType): void {
    this.presetCustomLoss(type);
    this.isValid.next(this.isCustom(type) ? this.form.valid : true);
    this.onChange.next({ type, customLoss: this.customLoss.value });
  }

  presetCustomLoss(type: TransformerType = this.params.type): void {
    if (this.isCustom(type)) {
      this.customLoss.enable();
      this.customLoss.setValidators([ Validators.required, Validators.min(0), Validators.max(5) ]);
    } else {
      this.customLoss.disable();
      this.customLoss.setValue(this.transformerTypeLoss[type]);
    }
    this.customLoss.updateValueAndValidity();
  }

  isCustom = (type: TransformerType): boolean => type === TransformerType.Custom;

}
