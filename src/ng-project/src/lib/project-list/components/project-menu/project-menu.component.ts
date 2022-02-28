import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { EnergySystemRef, Project, ProjectStatus } from '@solargis/types/project';

import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';
import { State } from 'ng-shared/core/reducers';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectIsUserLogged, selectUserRef } from 'ng-shared/user/selectors/auth.selectors';
import { selectHasAnyCompany, selectIsFreetrialToClaim } from 'ng-shared/user/selectors/company.selectors';
import { selectHasUserCompareAccess } from 'ng-shared/user/selectors/permissions.selectors';

import { CompareAddProjectRequest } from '../../../project/actions/compare.actions';
import { Delete, Update } from '../../../project/actions/project.actions';
import { AddToCompareDialogComponent } from '../../../project/dialogs/add-to-compare-dialog/add-to-compare-dialog.component';
import { ClaimTrialDialogComponent } from '../../../project/dialogs/claim-trial-dialog/claim-trial-dialog.component';
import { ProjectRenameDialogComponent } from '../../../project/dialogs/project-rename-dialog/project-rename-dialog.component';
import { SetTagDialogComponent } from '../../../project/dialogs/set-tag-dialog/set-tag-dialog.component';
import { TransferProjectsDialogComponent } from '../../../project/dialogs/transfer-projects-dialog/transfer-projects-dialog.component';
import { ExtendedProject, getProjectMetadataStatus } from '../../../project/reducers/projects.reducer';
import { getEnergySystem } from '../../../project/utils/map-default-energy-system.operator';
import { projectToClaimFreetrial } from '../../../project/utils/project-to-claim-freetrial.operator';
import { selectSelectedProject } from '../../selectors';
import { getProjectDefaultEnergySystemRef, transferAvailable } from '../../utils/project.utils';


@Component({
  selector: 'sg-project-menu',
  templateUrl: './project-menu.component.html',
  styleUrls: ['./project-menu.component.scss']
})
export class ProjectMenuComponent extends SubscriptionAutoCloseComponent implements OnInit, OnChanges {
  @Input() componentName: 'map' | 'list' | 'detail';
  @Input() project: Project;
  @Input() showOpen = true;
  @Input() showSettings: boolean;
  @Input() showExport = true;

  @Output() openShareDialog = new EventEmitter();
  @Output() openLayerSettings = new EventEmitter();
  @Output() openUnitSettings = new EventEmitter();
  @Output() exportProjects = new EventEmitter();

  selectedEnergySystemRef: EnergySystemRef;

  project$: Observable<ExtendedProject>;
  projectToClaimFreetrial$: Observable<Project>;
  hasCompareAccess$: Observable<boolean>;
  transferAvailable$: Observable<boolean>;
  updateDataAvailable$: Observable<boolean>;
  isLoggedIn$: Observable<boolean>;

  constructor(private readonly router: Router, private readonly store: Store<State>, private readonly dialog: MatDialog) {
    super();
    this.project$ = this.store.pipe(selectSelectedProject);
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.store.pipe(selectIsUserLogged);
    this.updateDataAvailable$ = this.project$.pipe(map(project => !getProjectMetadataStatus(project, 'prospect').latest));

    this.projectToClaimFreetrial$ = combineLatest([
      this.project$,
      this.store.pipe(selectIsFreetrialToClaim)
    ]).pipe(
      projectToClaimFreetrial()
    );

    this.transferAvailable$ = combineLatest([
      this.project$,
      this.store.pipe(selectUserRef),
      this.store.pipe(selectHasAnyCompany)
    ]).pipe(
      filter(([project]) => !!project && !!project.access),
      map(([project, user, hasAnyCompany]) => transferAvailable([project], user, hasAnyCompany))
    );

    this.hasCompareAccess$ = this.store.pipe(selectHasUserCompareAccess);
  }

  ngOnChanges(): void {
    this.selectedEnergySystemRef = getEnergySystem(this.project, 'prospect');
  }

  openProject(): void {
    const id = this.project._id;
    this.router.navigate(['/detail', id]);
  }

  renameProject(): void {
    this.dialog.open(ProjectRenameDialogComponent, {
      disableClose: false,
      // height: '132px',
      // width: '300px',
      data: { project: this.project }
    });
  }

  claimFreetrial(): void {
    this.dialog.open(ClaimTrialDialogComponent, { data: { project: this.project } });
  }

  compare(): void {
    const ref = this.selectedEnergySystemRef;
    if (ref) {
      this.store.dispatch(new CompareAddProjectRequest(ref));
      this.router.navigate(['compare']);
    } else {
      this.dialog
        .open(AddToCompareDialogComponent, { data: { sortBy: 'isSelected', order: 'desc' }})
        .afterClosed()
        .subscribe(res => {
          if (res && res.length > 0) {this.router.navigate(['compare']);}
        });
    }
  }

  addTo(): void {
    const { _id } = this.project;
    this.dialog.open(SetTagDialogComponent, { data: { projectIds: [_id] }});
  }

  updateStatus(status: ProjectStatus, requireConfirmation = false): void {
    const { _id } = this.project;

    if (!requireConfirmation) {
      this.store.dispatch(new Update({ _id, status }));
    } else {
      this.dialog
        .open(ConfirmationDialogComponent, { data: { text: 'common.confirmDialog.usure' }})
        .afterClosed()
        .pipe(filter(x => !!x))
        .subscribe(() => {
          this.store.dispatch(new Update({ _id, status }));
        });
    }
  }

  delete(): void {
    const { _id } = this.project;
    this.dialog
      .open(ConfirmationDialogComponent, { data: { text: 'common.confirmDialog.usure' }})
      .afterClosed()
      .subscribe(result => {
        if (result) {this.store.dispatch(new Delete(_id));}
      });
  }

  transfer(): void {
    const { _id } = this.project;
    this.dialog
      .open(TransferProjectsDialogComponent, { data: { projectIds: [_id] } })
      .afterClosed();
  }

  openUpdateDataDialog(): void {
    this.project$
      .pipe(first())
      .subscribe(project =>
        this.store.dispatch(new OpenUpdateProjectDataDialog(getProjectDefaultEnergySystemRef(project, 'prospect')))
      );
  }
}
