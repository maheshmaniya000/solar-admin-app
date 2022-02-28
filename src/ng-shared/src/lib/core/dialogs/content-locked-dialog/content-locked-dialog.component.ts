import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Project } from '@solargis/types/project';

import { State } from 'ng-shared/core/reducers';
import { prospectUpgradeUrl } from 'ng-shared/shared/utils/url.utils';

import { OpenActivateFreeTrialDialog, OpenRequestTrialDialog } from '../../actions/dialog.actions';
import { LockerDialog, lockerDialogContent } from './content-locked-dialog.data';

@Component({
  selector: 'sg-content-locked-dialog',
  templateUrl: './content-locked-dialog.component.html',
  styleUrls: ['./content-locked-dialog.component.scss']
})
export class ContentLockedDialogComponent implements OnInit {
  lockerDialogContent: LockerDialog;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      dialog: string;
      showFreeTrial?: boolean;
      showRequestFreeTrial?: boolean;
      projectId?: string;
      project?: Project;
    },
    @Inject('Window') private readonly window: Window,
    public dialogRef: MatDialogRef<ContentLockedDialogComponent>,
    public dialog: MatDialog,
    private readonly store: Store<State>,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.lockerDialogContent = lockerDialogContent[this.data.dialog];
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  redirectToUpgrade(): void {
    this.closeDialog();
    this.window.open(prospectUpgradeUrl, '_blank');
  }

  activateFreeTrial(): void {
    this.store.dispatch((new OpenActivateFreeTrialDialog(this.data.project)));
    this.closeDialog();
  }

  requestFreeTrial(): void {
    this.store.dispatch(new OpenRequestTrialDialog());
    this.closeDialog();
  }

  redirectToPVConfig(): void {
    const { projectId } = this.data;
    this.router.navigate(['detail', projectId, 'configure', 'change']);
    this.closeDialog();
  }
}
