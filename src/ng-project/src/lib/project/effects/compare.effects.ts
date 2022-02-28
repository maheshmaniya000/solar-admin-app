import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { merge } from 'rxjs';
import { filter, first, map, skip, switchMap, tap } from 'rxjs/operators';

import { VersionedDatasetDataMap } from '@solargis/types/dataset';
import { EnergySystemRef, getEnergySystemId } from '@solargis/types/project';

import { AddToCompareDialogComponent } from 'ng-project/project/dialogs/add-to-compare-dialog/add-to-compare-dialog.component';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { StorageProviderService } from 'ng-shared/core/services/storage-provider.service';
import { USER_LOGOUT } from 'ng-shared/user/actions/auth.actions';
import { SELECT_COMPANY, UNSELECT_COMPANY } from 'ng-shared/user/actions/company.actions';

import {
  CompareAddProjectAfterChecked,
  CompareAddProjectRequest,
  CompareBulkEdit,
  CompareClear,
  CompareRemoveProject,
  CompareShowProjectList,
  CompareShowReplaceDialog,
  COMPARE_ADD_PROJECT,
  COMPARE_ADD_PROJECT_AFTER_CHECKED,
  COMPARE_BULK_EDIT,
  COMPARE_SHOW_PROJECT_LIST,
  COMPARE_SHOW_REPLACE_DIALOG,
} from '../actions/compare.actions';
import { DataLoad } from '../actions/project-data.actions';
import { CompareReplaceProjectDialogComponent } from '../dialogs/compare-replace-project-dialog/compare-replace-project-dialog.component';
import { State } from '../reducers';
import { CompareState, COMPARE_MAX_PROJECTS } from '../reducers/compare.reducer';
import { selectCompareEnergySystemRefs } from '../selectors/compare.selectors';
import { getProjectAppDataSelector } from '../selectors/energy-system-data.selector';

const COMPARE_ITEMS = 'compare-items';

@Injectable()
export class CompareEffects {

  /**
   * Check number of projects in compare
   * If full, show replace dialog else add project and show dialog
   */
  @Effect({ dispatch: true })
  addToCompare$ = this.actions$.pipe(
    ofType<CompareAddProjectRequest>(COMPARE_ADD_PROJECT),
    switchMap(action => this.store.pipe(selectCompareEnergySystemRefs).pipe(first(), map(refs => [ action, refs ]))),
    switchMap(input => {
      const action = input[0] as CompareAddProjectRequest;
      const refs = input[1] as EnergySystemRef[];

      if (refs && refs.length >= COMPARE_MAX_PROJECTS) {
        return [
          new CompareShowReplaceDialog(action.payload),
        ] as Action[];
      } else {
        return [
          new CompareAddProjectAfterChecked(action.payload),
        ] as Action[];
      }
    }),
  );

  /**
   * Show replace dialog
   */
  @Effect({ dispatch: true})
  replaceDialog$ = this.actions$.pipe(
    ofType<CompareShowReplaceDialog>(COMPARE_SHOW_REPLACE_DIALOG),
    switchMap(action => this.dialog.open(CompareReplaceProjectDialogComponent, {
      data: {
        replace: action.payload
      }
    }).afterClosed().pipe(
      filter(x => !!x),
      map(toReplace => [action, toReplace])
    )),
    switchMap(([action, toReplace]) => [
      new CompareRemoveProject(toReplace),
      new CompareAddProjectAfterChecked(action.payload),
      new CompareShowProjectList(action.payload),
    ])
  );

  /**
   * Only show compare list
   */
  @Effect({ dispatch: false })
  openListDialog$ = this.actions$.pipe(
    ofType<CompareShowProjectList>(COMPARE_SHOW_PROJECT_LIST),
    switchMap(action => this.store.pipe(selectCompareEnergySystemRefs).pipe(first(), map(refs => [ action.payload, refs ]))),
    tap(() => {
      this.dialog.open(AddToCompareDialogComponent,
        {data: { sortBy: 'isSelected', order: 'desc' } });
    })
  );

  /**
   * Load data for added projects
   */
  @Effect({ dispatch: true })
  loadData$ = merge(
    this.actions$.pipe(
      ofType<CompareAddProjectAfterChecked>(COMPARE_ADD_PROJECT_AFTER_CHECKED),
      map(action => action.payload)
    ),
    this.actions$.pipe(
      ofType<CompareBulkEdit>(COMPARE_BULK_EDIT),
      switchMap(action => action.payload.toAdd),
      filter(x => !!x),
    ),
  ).pipe(
    switchMap((ref: EnergySystemRef) =>
      // FIXME why do we need to select project data here? it is never used
      this.store.pipe(
        select(getProjectAppDataSelector(ref)),
        first(),
        map(data => data && data.dataset),
        map(data => [ref, data] as [EnergySystemRef, VersionedDatasetDataMap])
      )
    ),
    switchMap(([ref,]) =>
      // TODO: add checks what we need to load
       [
        new DataLoad({ app: ref.app, projectId: ref.projectId }),
        new DataLoad(ref)
      ]
    ),
  );

  /**
   * Compare analytics
   */
  @Effect()
  amplitude$ = merge(
    this.actions$.pipe(
      ofType<CompareAddProjectAfterChecked>(COMPARE_ADD_PROJECT_AFTER_CHECKED),
      map(() => ({ addedCount: 1 }))
    ),
    this.actions$.pipe(
      ofType<CompareBulkEdit>(COMPARE_BULK_EDIT),
      filter(action => !action.payload.skipAnalytics),
      map(action => ({ addedCount: (action.payload.toAdd || []).length, removedCount: (action.payload.toRemove || []).length })),
    ),
  ).pipe(
    map(compare => new AmplitudeTrackEvent('compare_edit', { compare }))
  );

  /**
   * Clear compare on company switch
   *
   * @param actions$
   * @param dialog
   * @param store
   */
  @Effect({ dispatch: true })
  clearCompare$ = this.actions$.pipe(
    ofType(UNSELECT_COMPANY, SELECT_COMPANY, USER_LOGOUT),
    map(() => new CompareClear())
  );

  @Effect()
  initCompareProjects$ = this.store.select('project', 'energySystems').pipe(
    // first emit is init of state, we need to wait for data load
    skip(1),
    first(),
    map(energySystems => {
        const compareItems = this.storage.getItem(COMPARE_ITEMS);
        if (compareItems) {
          const parsedCompareItems: CompareState = JSON.parse(compareItems);
          const toAdd = parsedCompareItems.filter(i => energySystems.get(getEnergySystemId(i)));
          if (toAdd && toAdd.length) {
            return new CompareBulkEdit({ toAdd, skipAnalytics: true });
          }
        }
      }
    ),
    filter(x => !!x),
  );

  @Effect({ dispatch: false })
  saveCompareItemsToStorage$ = this.store.pipe(selectCompareEnergySystemRefs).pipe(
    // first emit is init of compare state, we would reset the data
    skip(1),
    tap(compareItems => this.storage.setItem(COMPARE_ITEMS, JSON.stringify(compareItems)))
  );

  private readonly storage: Storage;

  constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly store: Store<State>,
    private readonly storageProvider: StorageProviderService
  ) {
    this.storage = storageProvider.getLocalStorage();
  }
}
