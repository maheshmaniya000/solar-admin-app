import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { economyParameterUnits, economyCalculator, calculateEconomyStats } from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { EconomyInput } from '@solargis/types/economy';
import { SystemConfig } from '@solargis/types/pvlib';


function getGoalseekFunction(
  inputs: EconomyInput,
  pvcalcAnnual: AnnualDataMap,
  systemConfig: SystemConfig,
): (tariff: number) => number {
  inputs = { ...inputs };

  return (tariff: number) => {
    inputs.tariff = tariff;
    const economy = economyCalculator(inputs, pvcalcAnnual, systemConfig);
    const stats = calculateEconomyStats(economy);
    return stats.IRREquity;
  };
}

@Component({
  selector: 'sg-economy-tariff-dialog',
  templateUrl: './economy-tariff-dialog.component.html',
  styleUrls: ['./economy-tariff-dialog.component.scss']
})
export class EconomyTariffDialogComponent implements OnInit {

  form: FormGroup;
  unit = economyParameterUnits.IRREquity;
  tariffUnit = economyParameterUnits.tariff;

  calculating = false;
  result: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      inputs: EconomyInput;
      pvcalcAnnual: AnnualDataMap;
      systemConfig: SystemConfig;
    },
    public dialogRef: MatDialogRef<EconomyTariffDialogComponent>,
    public fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      IRREquity: [10, [Validators.min(0), Validators.max(100)]]
    });
  }

  calculate(): void {
    this.calculating = true;
    setTimeout(() => {
      this.result = this.goalseek(this.form.controls.IRREquity.value);
      this.calculating = false;
    });
  }

  goalseek(goalIRR = 10): number {
    const toGoalseekFn = getGoalseekFunction(
      this.data.inputs, this.data.pvcalcAnnual, this.data.systemConfig
    );

    let bottom = 0;
    let top = 1;
    let mid: number;
    const tolerance = 0.0000001;
    const minDiff = 0.00001;

    while ( bottom <= top && top - bottom > minDiff ) {

      mid = (top + bottom) / 2;
      const result = toGoalseekFn(mid);

      if ( Math.abs(result - goalIRR) < tolerance ) {
        break;
      } else {
        if ( result < goalIRR ) {
          bottom = mid + minDiff;
        } else {
          top = mid - minDiff;
        }
      }
    }

    return parseFloat(mid.toFixed(5));
  }

  closeDialog(result?: number): void {
    this.dialogRef.close(result);
  }

}
