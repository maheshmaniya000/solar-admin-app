import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, mergeMap } from 'rxjs/operators';

import { UserTag, BulkAssignUserTagOpts } from '@solargis/types/project';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';

import {
  TAG_CREATE, TAG_RENAME, TAG_DELETE, TAG_BULK_ASSIGN,
  BulkAssignTagsResult, BulkAssignTags, DeleteTag, TagsInit, CreateTagResult, CreateTag, DeleteTagResult, RenameTag, RenameTagResult
} from '../actions/user-tags.actions';
import { State } from '../reducers';
import { UserTagsService } from '../services/user-tags.service';

@Injectable()
export class UserTagsEffects {

  @Effect()
  initTags$ = this.store.pipe(
    selectUser,
    filter(x => !!x),
    map(user => user.sgAccountId),
    switchMap(() => this.tagService.getUserTags()),
    map(tags => new TagsInit(tags))
  );

  @Effect()
  createTag$ = this.actions$.pipe(
    ofType<CreateTag>(TAG_CREATE),
    switchMap(action => this.tagService.createUserTag(action.payload)),
    mergeMap((tag: UserTag) => [
      new CreateTagResult(tag),
      new AmplitudeTrackEvent('tag_create')
    ])
  );

  @Effect()
  renameTag$ = this.actions$.pipe(
    ofType<RenameTag>(TAG_RENAME),
    switchMap(action => this.tagService.renameUserTag(action.payload)),
    map(renameOpts => new RenameTagResult(renameOpts))
    // TODO track in amplitude?
  );

  @Effect()
  deleteTag$ = this.actions$.pipe(
    ofType<DeleteTag>(TAG_DELETE),
    switchMap(action => this.tagService.deleteUserTag(action.payload)),
    map((tag: UserTag) => new DeleteTagResult(tag)),
  );

  @Effect()
  bulkAssign$ = this.actions$.pipe(
    ofType<BulkAssignTags>(TAG_BULK_ASSIGN),
    switchMap(action =>
      this.tagService.bulkAssignTags(action.payload).pipe(map(result => [action.payload, result] as [BulkAssignUserTagOpts, UserTag[]]))
    ),
    mergeMap(([opts, tags]) => [
      new BulkAssignTagsResult(tags),
      new AmplitudeTrackEvent('tag_assigned_project', { count: opts.projects.length }),
    ])
  );

  constructor(
    private readonly actions$: Actions,
    private readonly tagService: UserTagsService,
    private readonly store: Store<State>,
  ) {}

}
