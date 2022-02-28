import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Project } from '@solargis/types/project';

import { ProjectRenameDialogComponent } from 'ng-project/project/dialogs/project-rename-dialog/project-rename-dialog.component';

@Component({
  selector: 'sg-project-site-card',
  styleUrls: ['./project-site-card.component.scss'],
  templateUrl: './project-site-card.component.html'
})
export class ProjectSiteCardComponent {
  @Input() project: Project;

  constructor(private readonly dialog: MatDialog) {}

  // TODO allow rename only if user is owner or editor
  renameProject(): void {
    this.dialog.open(ProjectRenameDialogComponent, {
      // height: '188px',
      // width: '440px',
      data: {
        project: this.project
      }
    });
  }
}
