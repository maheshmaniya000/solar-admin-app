import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { APIAccessType, APIContract, APIDataDelivery, APIMaxRequests, APIPvPlanner } from '@solargis/types/api/contract';
import {
  ProcessingGeometryKeys, ProcessingKey, ProcessingLocationKeys,
  ProcessingPVKeys, Summarization, Summarizations
} from '@solargis/types/api/data-delivery-ws';
import { removeEmpty } from '@solargis/types/utils';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

enum MonitorType {
  MONITOR_HARD = 'MONITOR_HARD',
  MONITOR_RELATIVE = 'MONITOR_RELATIVE',
  EVALUATE = 'EVALUATE'
}

/**
 * Component controlling/saving/updating api contracts.
 */
@Component({
  selector: 'sg-admin-single-api-contract',
  templateUrl: './admin.single-api-contract.component.html',
  styleUrls: [ '../../containers/api-contract/admin.api-contract-container.component.scss', 'admin.single-api-contract.component.scss' ]
})
export class AdminSingleApiContractComponent extends SubscriptionAutoCloseComponent implements OnInit {

  monitorType = MonitorType;

  summarizations = Summarizations;
  processingLocationKeys = ProcessingLocationKeys;
  processingGeometryKeys = ProcessingGeometryKeys;
  processingPVKeys = ProcessingPVKeys;

  @Input() apiContract = { } as APIContract;
  @Output() apiContractChange = new EventEmitter<APIContract>();

  @Output() newApiContractValid = new EventEmitter<boolean>();

  hasDataDeliveryContract = false;
  hasPvPlannerContract = false;

  // forms and form controls
  apiContractForm: FormGroup;
  get maxRequests(): FormArray { return this.apiContractForm.get('maxRequests') as FormArray; }

  dataDeliveryForm: FormGroup;
  dataDeliverySummarization: Summarization[] = [];
  dataDeliveryProcessingKeys: ProcessingKey[] = [];
  dataDeliveryHasForecast = false;
  dataDeliveryHasMonitor = false;
  get historic(): FormControl { return this.dataDeliveryForm.get('historic') as FormControl; }
  get historicType(): FormControl { return this.historic.get('historicType') as FormControl; }
  get forecast(): FormControl { return this.dataDeliveryForm.get('forecast') as FormControl; }
  pvPlannerForm: FormGroup;

  apiDataDelivery: APIDataDelivery = {
    access: {
      type: APIAccessType.GLOBAL // set default value for access
    }
  } as APIDataDelivery;
  apiPvPlanner = {
    access: {
      type: APIAccessType.GLOBAL // set default value for access
    }
  } as APIPvPlanner;

  constructor(private readonly fb: FormBuilder, private readonly datePipe: DatePipe) {
    super();
  }

  ngOnInit(): void {
    this.apiContractForm = this.fb.group({
      id: [undefined, []],
      title: [undefined, []],
      maxCountOfRequest: [undefined, [ ]],
      maxRequests: this.fb.array([])
    });

    this.dataDeliveryForm = this.fb.group({
      validFrom: [undefined, [ Validators.required ]],
      validTo: [undefined, [ Validators.required ]],

      maxDaysInRequest: [undefined, [ ]],
      maxUniqueInformationUnits: [undefined, []]
    });

    this.pvPlannerForm = this.fb.group({
      validFrom: [undefined, [ Validators.required ]],
      validTo: [undefined, [ Validators.required ]]
    });

    if (this.apiContract) {
      this.loadData();
    }

    this.apiContractForm.valueChanges.subscribe(form => {
      this.apiContract = { ...form };
      this.emitNewAPIContract();
    });

    // when value has been changed -> emit those new values
    this.dataDeliveryForm.valueChanges.subscribe(form => {
      if (this.dataDeliveryHasMonitor && form.historic) {
        if (form.historic.historicType === MonitorType.MONITOR_HARD && form.historic.historicHard) {
          form.historic = (d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))(form.historic.historicHard as Date);
        } else if (form.historic.historicType === MonitorType.MONITOR_RELATIVE && form.historic.historicRelative) {
          form.historic = form.historic.historicRelative;
        } else {
          delete form.historic;
        }
      } else {
        delete form.historic;
      }

      this.apiDataDelivery = {
        ...form,
        validFrom: form.validFrom ? form.validFrom.valueOf() : null,
        validTo: form.validTo ? form.validTo.valueOf() : null,
        access: this.apiDataDelivery ? this.apiDataDelivery.access : null,
      } as APIDataDelivery;
      this.emitNewAPIContract();
    });

    this.pvPlannerForm.valueChanges.subscribe(form => {
      this.apiPvPlanner = {
        ...form,
        validFrom: form.validFrom ? form.validFrom.valueOf() : null,
        validTo: form.validTo ? form.validTo.valueOf() : null,
        access: this.apiPvPlanner ? this.apiPvPlanner.access : null
      } as APIPvPlanner;
      this.emitNewAPIContract();
    });
  }

  /**
   * Load data from existing API contract
   */
  private loadData(): void {
    this.apiContractForm.patchValue(this.apiContract);
    this.maxRequests.controls = [];
    if (this.apiContract && this.apiContract.maxRequests) {
      for (const maxRequest of this.apiContract.maxRequests) {
        this.addNewMaxRequest(maxRequest);
      }
    } else {
      this.addNewMaxRequest();
    }

    // DATA DELIVERY will be loaded
    if (this.apiContract.dataDeliveryContract) {
      this.hasDataDeliveryContract = true;
      this.apiDataDelivery = this.apiContract.dataDeliveryContract;

      this.dataDeliveryProcessingKeys = this.apiContract.dataDeliveryContract.processingKeys;
      this.dataDeliverySummarization = this.apiContract.dataDeliveryContract.summarization;
      this.changeForecast(!!(this.apiContract.dataDeliveryContract.forecast));
      this.dataDeliveryHasMonitor = !!(this.apiContract.dataDeliveryContract.historic);
      this.dataDeliveryForm.patchValue({
        ... this.apiContract.dataDeliveryContract,
        validFrom: this.apiContract.dataDeliveryContract.validFrom ? new Date(this.apiContract.dataDeliveryContract.validFrom) : null,
        validTo: this.apiContract.dataDeliveryContract.validTo ? new Date(this.apiContract.dataDeliveryContract.validTo) : null
      });

      if (this.apiDataDelivery.historic) {
        const historicType = typeof this.apiDataDelivery.historic;
        const historic = this.apiDataDelivery.historic;
        this.changeMonitor(true);
        if (historicType === 'number') {
          this.dataDeliveryForm.patchValue({
            ... this.dataDeliveryForm.value,
            historic: {
              historicType: MonitorType.MONITOR_HARD,
              historicRelative: '1y',
              historicHard: new Date(historic)
            }
          });
        } else {
          this.dataDeliveryForm.patchValue({
            ... this.dataDeliveryForm.value,
            historic: {
              historicType: MonitorType.MONITOR_RELATIVE,
              historicRelative: historic,
              historicHard: new Date()
            }
          });
        }
      }
    }
    // PV PLANNER will be loaded
    if (this.apiContract.pvPlannerContract) {
      this.hasPvPlannerContract = true;
      this.apiPvPlanner = this.apiContract.pvPlannerContract;
      this.pvPlannerForm.patchValue({
        ... this.apiContract.pvPlannerContract,
        validFrom: this.apiContract.pvPlannerContract.validFrom ? new Date(this.apiContract.pvPlannerContract.validFrom) : null,
        validTo: this.apiContract.pvPlannerContract.validTo ? new Date(this.apiContract.pvPlannerContract.validTo) : null
      });
    }
  }

  addNewMaxRequest(maxRequestToLoad?: APIMaxRequests): void {
    const newMaxRequest = this.fb.group({
      count: [10, [ Validators.required ]],
      perSeconds: [60, [ Validators.required ]]
    });
    if (maxRequestToLoad) {
      newMaxRequest.patchValue(maxRequestToLoad);
    }
    this.maxRequests.push(newMaxRequest);
  }

  /**
   * Remove existing access site from form
   *
   * @param index
   */
  removeMaxRequest(index: number): void {
    if (this.maxRequests.length > 1 && index < this.maxRequests.length) {
      this.maxRequests.removeAt(index);
    }
  }

  changeSummarization(summarization: Summarization, $event: MatCheckboxChange): void {
    if (!$event.checked && this.dataDeliverySummarization.indexOf(summarization) > -1) {
      this.dataDeliverySummarization.splice(this.dataDeliverySummarization.indexOf(summarization), 1);
    }
    if ($event.checked && this.dataDeliverySummarization.indexOf(summarization) === -1) {
      this.dataDeliverySummarization.push(summarization);
    }
    this.emitNewAPIContract();
  }

  changeProcessingKeys(processingKeys: ProcessingKey, $event: MatCheckboxChange): void {
    if (!$event.checked && this.dataDeliveryProcessingKeys.indexOf(processingKeys) > -1) {
      this.dataDeliveryProcessingKeys.splice(this.dataDeliveryProcessingKeys.indexOf(processingKeys), 1);
    }
    if ($event.checked && this.dataDeliveryProcessingKeys.indexOf(processingKeys) === -1) {
      this.dataDeliveryProcessingKeys.push(processingKeys);
    }
    this.emitNewAPIContract();
  }

  changeForecast(isForecastChecked: boolean): void {
    this.dataDeliveryHasForecast = isForecastChecked;
    if (this.dataDeliveryHasForecast) {
      this.dataDeliveryForm.addControl('forecast', new FormControl(0, [Validators.required, Validators.min(0), Validators.max(10)]));
    } else {
      this.dataDeliveryForm.removeControl('forecast');
    }
  }

  changeMonitor(isMonitorChecked: boolean): void {
    this.dataDeliveryHasMonitor = isMonitorChecked;
    if (this.dataDeliveryHasMonitor) {
      this.dataDeliveryForm.addControl('historic', new FormGroup({
        historicType: new FormControl(MonitorType.MONITOR_RELATIVE, [Validators.required]),
        historicRelative: new FormControl('1y', [Validators.pattern('.*[0-9].*[dmy]')]),
        historicHard: new FormControl(new Date(), [])
      }));
    } else {
      this.dataDeliveryForm.removeControl('historic');
    }
  }

  loadAccessDefinition(api: APIPvPlanner, definition: any): void {
    if (api) {
      api.access = definition;
    }
    this.emitNewAPIContract();
  }

  checkAll(keys): void {
    for (const key of keys) {
      if (!this.dataDeliveryProcessingKeys.includes(key)) {
        this.dataDeliveryProcessingKeys.push(key);
      }
    }
    this.emitNewAPIContract();
  }

  emitNewAPIContract(): void {
    // construct API Contract
    if (this.hasDataDeliveryContract) {
      this.markFormGroupTouched(this.dataDeliveryForm);
      this.apiContract.dataDeliveryContract = {
        ...this.apiDataDelivery,
        summarization: this.dataDeliverySummarization,
        processingKeys: this.dataDeliveryProcessingKeys
      };
    } else {
      this.dataDeliverySummarization = [];
      this.dataDeliveryProcessingKeys = [];
      delete this.apiContract.dataDeliveryContract;
    }

    if (this.hasPvPlannerContract) {
      this.markFormGroupTouched(this.pvPlannerForm);
      this.apiContract.pvPlannerContract = this.apiPvPlanner;
    } else {
      delete this.apiContract.pvPlannerContract;
    }
    this.apiContractChange.emit(removeEmpty(this.apiContract, true));

    // validation
    this.newApiContractValid.emit(
      // dataDelivery is valid or not set
      (this.dataDeliveryForm.valid || !this.hasDataDeliveryContract) &&
      // pvPlanner is valid or not set
      (this.pvPlannerForm.valid || !this.hasPvPlannerContract) &&
      // dataDelivery or pvPlanner is set (at least one)
      (this.hasDataDeliveryContract || this.hasPvPlannerContract) &&
      // dataDelivery is valid when summarization + processing + access definition is set + forecast or monitor must be checked
      (!this.hasDataDeliveryContract ||
        (this.hasDataDeliveryContract && this.dataDeliverySummarization.length > 0 && this.dataDeliveryProcessingKeys.length > 0
          && this.apiContract.dataDeliveryContract.access != null
          && (this.dataDeliveryHasForecast || this.dataDeliveryHasMonitor)
        )
      )
      // pvPlanner is valid when access definition is set
      && (!this.hasPvPlannerContract || this.apiContract.pvPlannerContract.access != null)
    );
  }

  /**
   * Iterate over all form controls and make them touched
   *
   * @param formGroup
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
