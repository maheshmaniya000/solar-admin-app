import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { UserTag } from '@solargis/types/project';
import { OrderedMap } from '@solargis/types/utils';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { CreateTag, DeleteTag, RenameTag } from '../../actions/user-tags.actions';
import { State } from '../../reducers';
import { selectUserTags } from '../../selectors/tag.selectors';
import { RenameUserTagOpts } from '../../types/user-tag.types';

@Component({
  selector: 'sg-manage-tag-dialog',
  templateUrl: './manage-tag-dialog.component.html',
  styleUrls: ['./manage-tag-dialog.component.scss']
})
export class ManageTagsDialogComponent implements OnInit {

  editMode = false;
  editTag: UserTag;
  selectedTagIndex: number;
  tagNameControl: FormControl;
  tags$: Observable<OrderedMap<UserTag>>;

  constructor(
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageTagsDialogComponent>
    ) {}

  ngOnInit(): void {
    this.tags$ = this.store.pipe(selectUserTags);

    this.tagNameControl = new FormControl(null,
      [
        Validators.required,
        Validators.minLength(3),
        this.forbiddenNameValidator(),
      ]
    );
  }

  create(): void {
    const invalidCharacters = ['!','@','#','$','%','^','*','+','|','&','{','}','[',']','~','?',':','"','\\','`'];
    const hasInvalidCharacter = invalidCharacters.some(el => this.tagNameControl.value?.includes(el));

    if (hasInvalidCharacter) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          heading: 'project.tags.invalidCharHeading',
          text: 'project.tags.invalidCharText',
        }
      });
    } else {
      if (this.tagNameControl.valid) {
        this.store.dispatch(new CreateTag(this.tagNameControl.value));
        this.tagNameControl.setValue(null);
        this.tagNameControl.markAsUntouched();
        this.editTag = null;
      } else {
        this.tagNameControl.markAsTouched();
      }
    }
  }

  delete(tag: UserTag): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'project.tags.deleteHeading',
        text: { translate: 'project.tags.deleteText', translateParams: { tagName: tag.tagName } }
      }
    });
    dialogRef.afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result) {this.store.dispatch(new DeleteTag(tag));}
      });
  }

  renameTag(tag: UserTag): void {
    this.editMode = true;
    this.editTag = tag;
    this.selectedTagIndex = null;

    if (this.tagNameControl.valid) {
      const renameTagOpts: RenameUserTagOpts = {
        oldTagName: tag.tagName,
        tagName: this.tagNameControl.value
      };
      this.store.dispatch(new RenameTag(renameTagOpts));
      this.tagNameControl.setValue(null);
      this.tagNameControl.markAsUntouched();
      this.editTag = null;
    } else {
      this.tagNameControl.markAsTouched();
    }
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      let isError = null;
      this.tags$.pipe(first()).subscribe((tags: OrderedMap<UserTag>) => {
        if (this.editTag) {
          tags = tags.filter(tag => tag.tagName !== this.editTag.tagName);
        }
        isError = control.value && tags.get(control.value);
      });
      return isError ? { forbiddenName: { value: control.value } } : null;
    };
  }
}
