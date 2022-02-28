import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { getProjectPvConfig } from '@solargis/types/project';
import { getPvConfigStatus, PvConfig, PvConfigStatus } from '@solargis/types/pv-config';
import { latlngUnit } from '@solargis/units';

import { State } from 'ng-shared/core/reducers';
import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';

import { ProjectShareDialogComponent } from '../../../project/dialogs/project-share-dialog/project-share-dialog.component';
import { ExtendedProject, getProjectProgress, ProjectProgress } from '../../../project/reducers/projects.reducer';

@Component({
  selector: 'sg-selected-project',
  styleUrls: ['./selected-project.component.scss'],
  templateUrl: './selected-project.component.html',
})
export class SelectedProjectComponent implements OnChanges {

  @Input() project: ExtendedProject;
  @Input() freetrial: boolean;
  @Input() hasDataCoverage: boolean;

  @Output() onSaveProject = new EventEmitter();
  @Output() onFavorite = new EventEmitter<boolean>();
  @Output() exportProject = new EventEmitter<void>();

  progress: ProjectProgress = {};

  pvConfig?: PvConfig;
  pvConfigStatus: PvConfigStatus;
  latlngUnit = latlngUnit;

  isLoggedIn$: Observable<boolean>;

  constructor(private readonly dialog: MatDialog, private readonly store: Store<State>) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoggedIn$ = this.store.pipe(selectIsUserLogged);
    if (changes.project) {
      this.pvConfig = getProjectPvConfig(this.project, 'prospect');
      this.pvConfigStatus = getPvConfigStatus(this.pvConfig);
      this.progress = getProjectProgress(this.project);
    }
  }

  openShareDialog(): void {
    this.dialog.open(ProjectShareDialogComponent, {});
  }


  // TODO check access for all Project operations

}
