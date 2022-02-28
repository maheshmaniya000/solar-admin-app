import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { UserTag, UserTagList, BulkAssignUserTagOpts, UpdateUserTagOpts } from '@solargis/types/project';

import { Config } from 'ng-shared/config';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';

import { State } from '../reducers';
import { RenameUserTagOpts } from '../types/user-tag.types';

@Injectable()
export class UserTagsService implements OnDestroy {

  // we need just snapshot of sgAccountId,
  // in case of Observable we would need to pipe first() in every method to prevent API multi-calls
  sgAccountId: string;

  subscription: Subscription;

  constructor(private readonly http: HttpClient, store: Store<State>, private readonly config: Config) {
    this.subscription = store
      .pipe(
        selectUser,
        map(user => user && user.sgAccountId),
        distinctUntilChanged()
      )
      .subscribe(sgAccountId => this.sgAccountId = sgAccountId);
  }

  ngOnDestroy(): void {
    if (this.subscription) {this.subscription.unsubscribe();}
  }

  getUserTags(): Observable<UserTag[]> {
    return this.http.get(`${this.config.api.userTagUrl}/${this.sgAccountId}`).pipe(
      map((response: UserTagList) => response.data)
    );
  }

  createUserTag(tagName: string): Observable<UserTag> {
    const payload: Partial<UserTag> = { tagName };

    return this.http.post(`${this.config.api.userTagUrl}/${this.sgAccountId}`, payload).pipe(
      map(response => response as UserTag)
    );
  }

  renameUserTag({ oldTagName, tagName }: RenameUserTagOpts): Observable<RenameUserTagOpts> {
    return this.http.patch(
      `${this.config.api.userTagUrl}/${this.sgAccountId}/tag/${oldTagName}`,
      { operation: 'rename', tagName } as UpdateUserTagOpts
    ).pipe(map(() => ({ oldTagName, tagName })));
  }

  deleteUserTag(tag: UserTag): Observable<UserTag> {
    return this.http.delete(`${this.config.api.userTagUrl}/${this.sgAccountId}/tag/${tag.tagName}`).pipe(
      map(() => tag),
    );
  }

  bulkAssignTags(bulkOpts: BulkAssignUserTagOpts): Observable<UserTag[]> {
    return this.http.patch(`${this.config.api.userTagUrl}/${this.sgAccountId}/`, bulkOpts).pipe(
      map((response: UserTagList) => response.data),
    );
  }

}
