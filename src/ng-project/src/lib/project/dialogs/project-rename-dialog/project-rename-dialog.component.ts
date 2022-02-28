import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { Project } from '@solargis/types/project';

import { Update } from '../../actions/project.actions';
import { ProjectNamePipe } from '../../pipes/project-name.pipe';
import { State } from '../../reducers';


@Component({
  selector: 'sg-project-rename-dialog',
  styleUrls: ['./project-rename-dialog.component.scss'],
  templateUrl: './project-rename-dialog.component.html'
})
export class ProjectRenameDialogComponent {

  project: Project;
  name: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly store: Store<State>,
    private readonly dialogRef: MatDialogRef<ProjectRenameDialogComponent>,
    private readonly projectNamePipe: ProjectNamePipe
  ) {
    this.project = data.project;
    this.name = projectNamePipe.transform(data.project, null);
  }

  @HostListener('document:keyup.enter')
  searchResults(): void {
    this.closeDialog(true);
  }

  closeDialog(save: boolean = false): void {
    if (save) {
      const _id = this.project._id;
      const projectUpdate = { name: this.name };
      this.store.dispatch(new Update({ _id, ...projectUpdate }));
    }
    this.dialogRef.close();
  }
}
