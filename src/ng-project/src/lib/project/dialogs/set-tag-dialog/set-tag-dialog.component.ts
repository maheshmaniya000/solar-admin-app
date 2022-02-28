import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { ProjectId, UserTag } from '@solargis/types/project';
import { OrderedMap, sum } from '@solargis/types/utils';

import { BulkAssignTags } from 'ng-project/project/actions/user-tags.actions';
import { ExtendedProject } from 'ng-project/project/reducers/projects.reducer';
import { selectUserTags } from 'ng-project/project/selectors/tag.selectors';

import { State } from '../../reducers';
import { ManageTagsDialogComponent } from '../manage-tag-dialog/manage-tag-dialog.component';

type TagStatus = 'checked' | 'unchecked' | 'indeterminate';

@Component({
  selector: 'sg-set-tag-dialog',
  templateUrl: './set-tag-dialog.component.html',
  styleUrls: ['./set-tag-dialog.component.scss']
})
export class SetTagDialogComponent implements OnInit {

  projectIds: ProjectId[];
  originalTagStatus: {[key: string]: TagStatus} = {};
  tagStatus: {[key: string]: TagStatus} = {};

  project$: Observable<ExtendedProject>;
  tags$: Observable<OrderedMap<UserTag>>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: any,
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<SetTagDialogComponent>
    ) {
      this.projectIds = data.projectIds;
    }

  ngOnInit(): void {
    this.tags$ = this.store.pipe(selectUserTags);

    this.tags$
      .pipe(first())
      .subscribe((tags: OrderedMap<UserTag>) => {
        // TODO user-tags
        tags.forEach((tag: UserTag) => {
          const tagProjects = new Set(tag.projects);
          const tagOccurenceCount = sum(this.projectIds.map(projectId => +tagProjects.has(projectId)));

          this.tagStatus[tag.tagName] = 'unchecked';
          if (tagOccurenceCount === this.projectIds.length) {this.tagStatus[tag.tagName] = 'checked';}
          else if (tagOccurenceCount > 0) {this.tagStatus[tag.tagName] = 'indeterminate';}
        });
        this.originalTagStatus = { ...this.tagStatus };
      });
  }

  select(tagName: string, checked: boolean): void {
    this.tagStatus[tagName] = checked ? 'checked' : 'unchecked';
  }

  save(): void {
    const tagNames = Object.keys(this.tagStatus);

    const toAssignTags = tagNames.filter(
      tagName => this.tagStatus[tagName] === 'checked' && this.originalTagStatus[tagName] !== this.tagStatus[tagName]
    );
    const toRemoveTags = tagNames.filter(
      tagName => this.tagStatus[tagName] === 'unchecked'
                  && this.originalTagStatus[tagName] !== this.tagStatus[tagName]
                  && this.originalTagStatus[tagName] !== undefined
    );

    if (toAssignTags.length || toRemoveTags.length) {
      this.store.dispatch(new BulkAssignTags({ projects: this.projectIds, toAssignTags, toRemoveTags }));
    }

    this.dialogRef.close();
  }

  openManageLabelsDialog(): void {
    this.dialog.open(ManageTagsDialogComponent, {
    });
  }
}
