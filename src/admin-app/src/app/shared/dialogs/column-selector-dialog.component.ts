import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface Column<T extends string> {
  label: string;
  props: T | T[];
  selected: boolean;
}

export interface ColumnSelectorDialogData<T extends string> {
  columns: Column<T>[];
}

@Component({
  templateUrl: './column-selector-dialog.component.html',
  styleUrls: ['./column-selector-dialog.component.scss']
})
export class ColumnSelectorDialogComponent<T extends string> {
  constructor(
    public dialogRef: MatDialogRef<ColumnSelectorDialogComponent<T>, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: ColumnSelectorDialogData<T>
  ) {}

  onCancelButtonClick(): void {
    this.dialogRef.close();
  }

  onConfirmButtonClick(): void {
    this.dialogRef.close(this.data.columns.filter(column => column.selected).flatMap(column => column.props));
  }
}
