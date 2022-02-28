import { Component, Input, EventEmitter, Output, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, first, filter } from 'rxjs/operators';

import { staticMapUrl, StaticMapSize } from '@solargis/types/map';
import { Project } from '@solargis/types/project';
import { Orientation, validate } from '@solargis/types/pv-config';
import { latlngToAzimuth, LatLngZoom } from '@solargis/types/site';

import { ProspectAppConfig } from 'ng-shared/config';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { selectSelectedProjectAppData } from '../../../project-detail/selectors';
import { State } from '../../../project/reducers';
import { mapDatasetData } from '../../../project/utils/map-dataset-data.operator';
import { satelliteMapLayerId } from '../../../utils/map.constants';


@Component({
  selector: 'sg-pv-param-orientation',
  templateUrl: './pv-param-orientation.component.html',
  styleUrls: ['./pv-param-orientation.component.scss'],
})
export class PvParamOrientationComponent extends SubscriptionAutoCloseComponent implements OnInit {
  MIN_AZIMUTH = 0;
  MAX_AZIMUTH = 360;
  MIN_TILT = 0;
  MAX_TILT = 90;

  @Input() params: Orientation;
  @Input() project: Project;
  @Input() expanded: boolean;

  @Output() onChange: EventEmitter<Orientation> = new EventEmitter<Orientation>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: FormGroup;
  imgSrc: string;

  constructor(
    private readonly store: Store<State>,
    private readonly config: ProspectAppConfig, @Inject('Window')
    private readonly window: Window
    ) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
    // create form
      azimuth: new FormControl(this.params.azimuth, [
        Validators.required, Validators.min(this.MIN_AZIMUTH), Validators.max(this.MAX_AZIMUTH)
      ]),
      tilt: new FormControl(this.params.tilt, [
        Validators.required, Validators.min(this.MIN_TILT), Validators.max(this.MAX_TILT)
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
          const params: Orientation = {
            azimuth: validate(change.azimuth, this.MIN_AZIMUTH, this.MAX_AZIMUTH),
            tilt: validate(change.tilt, this.MIN_TILT, this.MAX_TILT),
          };

          this.onChange.next(params);
        })
    );

    this.addSubscription(
      this.form.statusChanges.subscribe(change => this.isValid.next(change === 'VALID'))
    );

    this.mapUrl();
  }

  setOptimum(): void {
    // FIXME OPTA and OPTA_AZIMUTH should be in @Input, otherwise this is container component
    this.store.pipe(
      selectSelectedProjectAppData,
      mapDatasetData('lta', 'annual'),
      first()
    ).subscribe(ltaAnnual => {
      const OPTA_AZIMUTH = latlngToAzimuth(this.project.site.point);
      this.form.controls.azimuth.setValue(OPTA_AZIMUTH);
      this.form.controls.tilt.setValue(ltaAnnual.OPTA);
    });
  }

  cssRotate(degrees: number): string {
    return `rotate(${degrees}deg)`;
  }

  private mapUrl(): void {
    const layerDef = this.config.map.layers.find(layer => layer._id === satelliteMapLayerId);
    const center: LatLngZoom = { ...this.project.site.point, zoom: 16 };
    const size: StaticMapSize = {
      width: 400,
      height: 400,
      devicePixelRatio: this.window.devicePixelRatio
    };
    this.imgSrc = staticMapUrl(layerDef, center, size);
  }
}
