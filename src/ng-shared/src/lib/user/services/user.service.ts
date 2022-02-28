import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@solargis/types/user-company';

import { Config } from '../../config';


@Injectable({ providedIn: 'root' })
export class UserService {

  userApiUrl: string;

  constructor(private readonly config: Config, private readonly http: HttpClient) {
    this.userApiUrl = `${config.api.customerUrl}/user`;
  }

  getUserInfo(sgAccountId: string): Observable<User> {
    return this.http.get(`${this.config.api.customerUrl}/user/${encodeURIComponent(sgAccountId)}`).pipe(
      map(result => result as User)
    );
  }

  updateUser(sgAccountId: string, updated: Partial<User>): Observable<User> {
    return this.http.patch(`${this.userApiUrl}/${encodeURIComponent(sgAccountId)}`, updated).pipe(
      map(result => result as User)
    );
  }

  storeSelectedCompany(sgAccountId: string, sgCompanyId: string): Observable<User> {
    const request: Partial<User> = {
      selectedSgCompanyId: sgCompanyId,
    };
    return this.updateUser(sgAccountId, request);
  }

}
