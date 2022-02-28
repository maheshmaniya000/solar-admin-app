import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { throwError } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { GeolocatorService } from 'ng-shared/core/services/geolocator.service';

import { MapComponent } from '../../components/map.component';
import { CustomControlComponent } from '../custom-control.component';

export enum LocationStatus {
  init = -1,
  inProgress = -2,
  success = 0,
  denied = 1,  // PositionError.PERMISSION_DENIED
  unavailable, // PositionError.POSITION_UNAVAILABLE
  timeout      // PositionError.TIMEOUT
}

// timeout 3 unavailable 2 denied 1

@Component({
  selector: 'sg-map-location',
  styleUrls: ['./map-location.component.scss'],
  templateUrl: './map-location.component.html'
})
export class MapLocationComponent extends CustomControlComponent implements OnInit, OnChanges {

  @Input() projectWithPosition: boolean;

  @Output() onGeolocation = new EventEmitter<GeolocationPosition>();

  status: LocationStatus = LocationStatus.init;

  iconMap = {
    [ LocationStatus.init ]: 'gps_fixed', // 'place',
    [ LocationStatus.inProgress]: 'gps_not_fixed',
    [ LocationStatus.success]: 'place',
    [ LocationStatus.denied ]: 'gps_off',
    [ LocationStatus.unavailable ]: 'gps_off',
    [ LocationStatus.timeout ]: 'gps_not_fixed'
  };

  constructor(mapComponent: MapComponent, el: ElementRef,
              private readonly transloco: TranslocoService,
              private readonly geolocator: GeolocatorService,
              private readonly snackBar: MatSnackBar) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.projectWithPosition) {
      if (this.projectWithPosition) {
        this.status = LocationStatus.success;

      } else if (this.status === LocationStatus.success) {
        this.status = LocationStatus.init;
      }
    }
  }

  locate(timeout?: number): void {
    this.geolocator.locate(timeout)
      .pipe(
        catchError((err: GeolocationPositionError) => {
          this.status = err.code;

          const msgKey = `map.location.error.${err.code}`;
          const actionKey = 'map.location.tryAgain';

          this.transloco.selectTranslate([msgKey, actionKey])
            .pipe(first())
            .subscribe(msgs => {
              const [msg, action] = msgs;
              this.snackBar
                .open(msg, err.code === err.TIMEOUT ? action : null, { duration: 5000 })
                .onAction().subscribe(() => this.locate(30000));
            });

          return throwError(err);
        })
      )
      .subscribe(
        (pos: GeolocationPosition) => this.onGeolocation.emit(pos),
        err => console.log('Geolocation not available', err)
      );
  }

}
