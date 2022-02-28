import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppDevice, SolargisApp } from '@solargis/types/user-company';

import { Config } from '../config';
import { UpdateAppDeviceRequest } from './update-app-device-request.model';

@Injectable({ providedIn: 'root' })
export class AppDeviceService {
  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  getAppDevices(app: SolargisApp, companyId: string, userId?: string): Observable<AppDevice[]> {
    return this.http.get<AppDevice[]>(`${this.config.api.customerUrl}/app-device/${app}/${companyId}${userId ? `/${userId}` : ''}`);
  }

  updateAppDevice({ key, update }: UpdateAppDeviceRequest): Observable<AppDevice> {
    return this.http.patch<AppDevice>(
      `${this.config.api.customerUrl}/app-device/${key.app}/${key.sgCompanyId}/${key.sgAccountId}/${key.osFingerprint}`,
      update
    );
  }
}
