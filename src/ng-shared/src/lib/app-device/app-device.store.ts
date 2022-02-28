import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { Observable, OperatorFunction, pipe } from 'rxjs';
import { filter, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AppDevice, Company, SolargisApp } from '@solargis/types/user-company';

import { State } from 'ng-shared/user/reducers';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { UserState } from 'ng-shared/user/types';
import { getAppDeviceKeyId } from 'ng-shared/utils/app-device.utils';

import { AppDeviceService } from './app-device.service';
import { UpdateAppDeviceRequest } from './update-app-device-request.model';

type LoadingStatus = 'not-loaded' | 'loading' | 'loaded';

interface AppDevicesState extends EntityState<AppDevice> {
  status: LoadingStatus;
}

@Injectable()
export class AppDeviceStore extends ComponentStore<AppDevicesState> {
  readonly setStatus = this.updater((state, status: LoadingStatus) => ({ ...state, status }));

  readonly setDevices = this.updater((state, devices: AppDevice[]) => this.adapter.setAll(devices, { ...state, status: 'loaded' }));

  readonly setDevice = this.updater((state, device: AppDevice) =>
    this.adapter.updateOne({ id: getAppDeviceKeyId(device), changes: device }, state)
  );

  readonly status$ = this.select(state => state.status);

  readonly loadUserAppDevices = this.effect((trigger$: Observable<SolargisApp>) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(selectActiveOrNoCompany), this.store.pipe(selectUser), (app, company: Company, user: UserState) => ({
        app,
        company,
        userId: user.sgAccountId
      })),
      this.loadDevices()
    )
  );

  readonly loadActiveCompanyAppDevices = this.effect((trigger$: Observable<SolargisApp>) =>
    trigger$.pipe(
      withLatestFrom(this.store.pipe(selectActiveOrNoCompany), (app, company) => ({
        app,
        company
      })),
      this.loadDevices()
    )
  );

  readonly loadCompanyAppDevices = this.effect((trigger$: Observable<{app: SolargisApp; company: Company}>) =>
    trigger$.pipe(
      this.loadDevices()
    )
  );

  readonly updateDevice = this.effect((update$: Observable<UpdateAppDeviceRequest>) =>
    update$.pipe(
      switchMap(update => this.appDeviceService.updateAppDevice(update)),
      tap<AppDevice>(updatedDevice => this.setDevice(updatedDevice))
    )
  );

  private readonly adapter: EntityAdapter<AppDevice> = createEntityAdapter<AppDevice>({
    selectId: getAppDeviceKeyId
  });

  constructor(private readonly store: Store<State>, private readonly appDeviceService: AppDeviceService) {
    super();
    this.setState(this.adapter.getInitialState({ status: 'not-loaded' }));
  }

  readonly devices$ = (app: SolargisApp): Observable<AppDevice[]> =>
    this.select(this.state$, state => Object.values(state.entities).filter(device => device.app === app));

  private loadDevices(): OperatorFunction<{ app: SolargisApp; company: Company; userId?: string }, AppDevice[]> {
    return pipe(
      withLatestFrom(this.status$),
      filter(([, status]) => status === 'not-loaded'),
      filter(([{ app, company }]) => !!company?.sgCompanyId && !!company.app[app]?.subscription),
      tap(() => this.setStatus('loading')),
      switchMap(([{ app, company, userId }]) => this.appDeviceService.getAppDevices(app, company.sgCompanyId, userId)),
      tap(devices => this.setDevices(devices))
    );
  }
}
