import { SgScssVariables } from '../../../styles/scss-variables';
import { RangeRiderStop } from '../model/range-rider-stop.model';

export class RangeRiderMocks {
  static readonly simpleMockStops: RangeRiderStop[] = [
    {
      value: 0,
      color: SgScssVariables.sgColors.status.error
    },
    {
      value: 10,
      color: SgScssVariables.sgColors.status.warning
    },
    {
      value: 15,
      color: SgScssVariables.sgColors.status.success
    }
  ];

  static readonly mockStopsWithIntervalOfOneColor: RangeRiderStop[] = [
    {
      value: 5,
      color: SgScssVariables.sgColors.status.error
    },
    {
      value: 15,
      color: SgScssVariables.sgColors.status.warning
    },
    {
      value: 15,
      color: SgScssVariables.sgColors.status.success
    },
    {
      value: 20,
      color: SgScssVariables.sgColors.status.success
    },
    {
      value: 20,
      color: SgScssVariables.sgColors.status.warning
    },
    {
      value: 30,
      color: SgScssVariables.sgColors.status.error
    }
  ];
}
