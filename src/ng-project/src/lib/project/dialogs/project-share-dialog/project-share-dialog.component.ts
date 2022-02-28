import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'sg-share-dialog',
  styleUrls: [ './project-share-dialog.component.scss' ],
  templateUrl: './project-share-dialog.component.html'
})
export class ProjectShareDialogComponent {
  @Input() url = window.location.href;

  @ViewChild('urlInput', { static: true }) urlInput;
  @ViewChild('snackbar', { static: true }) snackBarTemplate: TemplateRef<any>;

  constructor(private readonly dialogRef: MatDialogRef<ProjectShareDialogComponent>,
              private readonly snackBar: MatSnackBar,
              @Inject(DOCUMENT) private readonly dom: Document) {}

  copyToClipboard(): void {
    this.urlInput.nativeElement.select();
    this.dom.execCommand('copy');
    this.openSnackbar();
    this.closeDialog();
  }

  openSnackbar(): void {
    this.snackBar.openFromTemplate(this.snackBarTemplate, { duration: 3000 });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
