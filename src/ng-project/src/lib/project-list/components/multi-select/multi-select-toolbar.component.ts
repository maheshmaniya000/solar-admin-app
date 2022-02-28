import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { EnergySystemRef, getProjectDefaultSystemId, Project, ProjectId, ProjectStatus } from '@solargis/types/project';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { selectUserRef } from 'ng-shared/user/selectors/auth.selectors';
import { selectHasAnyCompany } from 'ng-shared/user/selectors/company.selectors';
import { selectHasUserCompareAccess } from 'ng-shared/user/selectors/permissions.selectors';

import { CompareBulkEdit } from '../../../project/actions/compare.actions';
import { SetTagDialogComponent } from '../../../project/dialogs/set-tag-dialog/set-tag-dialog.component';
import { TransferProjectsDialogComponent } from '../../../project/dialogs/transfer-projects-dialog/transfer-projects-dialog.component';
import { selectProjectsByIds } from '../../../project/reducers';
import { ExtendedProject } from '../../../project/reducers/projects.reducer';
import { ClearSelected, DeleteSelected, ExportSelected, UpdateSelected } from '../../actions/selected.actions';
import { Sort } from '../../actions/sort.actions';
import { State } from '../../reducers';
import { ProjectFilter } from '../../reducers/filter.reducer';
import { selectFilteredProjects, selectFilteredSelectedProjects, sortSelectedFirst } from '../../selectors';
import { transferAvailable } from '../../utils/project.utils';

@Component({
  selector: 'sg-multi-select-toolbar',
  templateUrl: './multi-select-toolbar.component.html',
  styleUrls: ['./multi-select-toolbar.component.scss']
})
export class MultiSelectToolbarComponent implements OnInit, OnDestroy {

  @Input() component: 'map' | 'list' | 'detail';

  selectedProjects$: Observable<Project[]>;
  selectedProjectIds: ProjectId[] = [];
  // allSelectedFavorite: boolean;
  filter: ProjectFilter;

  selectedFirst$: Observable<boolean>;
  transferAvailable$: Observable<boolean>;
  hasCompareAccess$: Observable<boolean>;

  projectsCount = 0;

  subscriptions: Subscription[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly store: Store<State>
  ) {}

  ngOnInit(): void {
    this.selectedProjects$ = this.store.pipe(selectFilteredSelectedProjects);

    this.subscriptions.push(
      this.selectedProjects$.subscribe(projects => {
        this.selectedProjectIds = projects.map(project => project._id);
        // this.allSelectedFavorite = projects.every(project => project.favorite); // TODO user-tags
      }),
      this.store.select('projectList', 'filter').subscribe(filter => this.filter = filter)
    );
    this.selectedFirst$ = this.store.pipe(select(sortSelectedFirst));

    this.transferAvailable$ = combineLatest(
      this.selectedProjects$,
      this.store.pipe(selectUserRef),
      this.store.pipe(selectHasAnyCompany)
    ).pipe(
      map(([selectedProjects, user, hasAnyCompany]) => transferAvailable(selectedProjects, user, hasAnyCompany))
    );

    this.hasCompareAccess$ = this.store.pipe(selectHasUserCompareAccess);

    this.store.pipe(
      selectFilteredProjects,
      first()
    ).subscribe(allProjects => this.projectsCount = allProjects.length);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      subscription => subscription.unsubscribe()
    );
  }

  selectedFirst(selectedFirst: boolean): void {
    this.store.dispatch(new Sort({ selectedFirst }));
  }

  deselectAll(): void {
    this.store.dispatch(new ClearSelected());
  }

  updateSelectedStatus(status: ProjectStatus, requireConfirmation = false): void {
    if (!requireConfirmation) {
      this.store.dispatch(new UpdateSelected({ status }));
    } else {
      let data: { heading: string; text: string };
      if (status === 'active') {
        data = {
          heading: 'project.action.unArchive',
          text: 'project.action.unArchiveText'
        };
      } else {
        data = {
          text: 'project.action.archiveText',
          heading: 'project.action.archive'
        };
      }
      this.dialog.open(ConfirmationDialogComponent, {
        data
      }).afterClosed().subscribe(result => {
        if (result) {this.store.dispatch(new UpdateSelected({ status }));}
      });
    }
  }

  deleteSelected(): void {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        text: 'common.confirmDialog.usure'
      },
    }).afterClosed().subscribe(result => {
      if (result) {this.store.dispatch(new DeleteSelected());}
    });
  }

  addTo(): void {
    this.dialog.open(SetTagDialogComponent, {
      data: {
        projectIds: this.selectedProjectIds,
      }
    });
  }

  transferProjects(): void {
    this.dialog.open(TransferProjectsDialogComponent, {
      data: {
        projectIds: this.selectedProjectIds
      }
    }).afterClosed();
  }

  compareSelected(): void {
    this.store.pipe(selectProjectsByIds(this.selectedProjectIds))
      .pipe(first())
      .subscribe(
        (projects: ExtendedProject[]) => {
          this.store.dispatch(new CompareBulkEdit({
            toAdd: projects.map(project => ({
              projectId: project._id,
              systemId: getProjectDefaultSystemId(project, 'prospect'),
              app: 'prospect'
            } as EnergySystemRef)),
            clearAll: true
          }));
          this.router.navigate(['compare']);
        }
      );
  }

  exportProjects(): void {
    this.store.dispatch(new ExportSelected());
  }
}
