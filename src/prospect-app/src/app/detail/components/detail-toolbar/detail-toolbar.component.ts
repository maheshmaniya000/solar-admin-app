import { Location } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { EnergySystemRef, Project, ProjectStatus } from '@solargis/types/project';

import { selectSelectedEnergySystemMetadataLatest } from 'ng-project/project-detail/selectors';
import { getProjectDefaultEnergySystemRef, transferAvailable } from 'ng-project/project-list/utils/project.utils';
import { CompareAddProjectRequest } from 'ng-project/project/actions/compare.actions';
import { Delete, Export, Update } from 'ng-project/project/actions/project.actions';
import { ClaimTrialDialogComponent } from 'ng-project/project/dialogs/claim-trial-dialog/claim-trial-dialog.component';
import { ProjectRenameDialogComponent } from 'ng-project/project/dialogs/project-rename-dialog/project-rename-dialog.component';
import { ProjectShareDialogComponent } from 'ng-project/project/dialogs/project-share-dialog/project-share-dialog.component';
import { SetTagDialogComponent } from 'ng-project/project/dialogs/set-tag-dialog/set-tag-dialog.component';
import { TransferProjectsDialogComponent } from 'ng-project/project/dialogs/transfer-projects-dialog/transfer-projects-dialog.component';
import { State } from 'ng-project/project/reducers';
import { isProjectEligibleToClaimFreetrial } from 'ng-project/project/utils/project-freetrial.utils';
import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';
import { SettingsToggles as SettingsToggleAction } from 'ng-shared/core/actions/settings.actions';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToggleDataUnitsDialogComponent } from 'ng-shared/shared/components/toggle-data-units-dialog/toggle-data-units-dialog.component';
import { selectUserRef } from 'ng-shared/user/selectors/auth.selectors';
import { selectHasAnyCompany } from 'ng-shared/user/selectors/company.selectors';

@Component({
  selector: 'sg-detail-toolbar',
  templateUrl: './detail-toolbar.component.html',
  styleUrls: ['./detail-toolbar.component.scss']
})
export class DetailToolbarComponent implements OnInit {

  @Input() project: Project;
  @Input() energySystemRef: EnergySystemRef;
  @Input() freetrialToClaim: boolean;
  @Input() freetrial: boolean;
  @Input() hasCompareAccess: boolean;

  transferAvailable$: Observable<boolean>;
  updateDataAvailable$: Observable<boolean>;

  constructor(
    private readonly store: Store<State>,
    private readonly location: Location,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    @Inject('Window') private readonly window: Window
  ) {}

  ngOnInit(): void {
    this.transferAvailable$ = combineLatest([
      this.store.pipe(selectUserRef),
      this.store.pipe(selectHasAnyCompany)
    ]).pipe(
      map(([user, hasAnyCompany]) => transferAvailable([this.project], user, hasAnyCompany))
    );
    this.updateDataAvailable$ = this.store.select(selectSelectedEnergySystemMetadataLatest('prospect')).pipe(
      map(latest => !latest)
    );
  }

  projectToClaimFreetrial(): Project {
    return this.freetrialToClaim && isProjectEligibleToClaimFreetrial(this.project)
      ? this.project
      : undefined;
  }

  renameProject(): void {
    this.dialog.open(ProjectRenameDialogComponent, {
      disableClose: false,
      data: { project: this.project }
    });
  }

  back(): void {
    this.window.history.length <= 2 ? this.router.navigate(['/map']) : this.location.back();
  }

  share(): void {
    this.dialog.open(ProjectShareDialogComponent, {});
  }

  // FIXME: copy-pasted code in multiple compoments
  updateStatus(status: ProjectStatus, requireConfirmation = false): void {
    if (!requireConfirmation) {
      this.store.dispatch(new Update({ _id: this.project._id, status }));
    } else {
      this.dialog
        .open(ConfirmationDialogComponent, { data: { text: 'common.confirmDialog.usure' }})
        .afterClosed()
        .pipe(filter(x => !!x))
        .subscribe(() => {
          this.store.dispatch(new Update({ _id: this.project._id, status }));
          this.router.navigate(['list']);
        });
    }
  }

  compare(): void {
    this.store.dispatch(new CompareAddProjectRequest(this.energySystemRef));
    this.router.navigate(['compare']);
  }

  addTo(): void {
    this.dialog.open(SetTagDialogComponent, { data: { projectIds: [this.project._id] }});
  }

  delete(): void {
    this.dialog
      .open(ConfirmationDialogComponent, { data: { text: 'common.confirmDialog.usure' }})
      .afterClosed()
      .subscribe(result => {
        if (result) {this.store.dispatch(new Delete(this.project._id));}
      });
  }

  transfer(): void {
    this.dialog.open(TransferProjectsDialogComponent, { data: { projectIds: [this.project._id] }}).afterClosed();
  }

  claimFreetrial(): void {
    this.dialog.open(ClaimTrialDialogComponent, { data: { project: this.projectToClaimFreetrial() } });
  }

  openSystemSettings(): void {
    const path = this.energySystemRef?.systemId ? ['configure', 'editor'] : ['configure'];
    this.router.navigate(['/detail', this.project._id, ...path]);
  }

  openUnitSettings(): void {
    this.dialog.open(ToggleDataUnitsDialogComponent, {}).afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result) {
          this.store.dispatch(new SettingsToggleAction(result));
        }
      });
  }

  exportProject(): void {
    this.store.dispatch(new Export(this.project));
  }

  openUpdateDataDialog(): void {
    this.store.dispatch(new OpenUpdateProjectDataDialog(getProjectDefaultEnergySystemRef(this.project, 'prospect')));
  }
}
