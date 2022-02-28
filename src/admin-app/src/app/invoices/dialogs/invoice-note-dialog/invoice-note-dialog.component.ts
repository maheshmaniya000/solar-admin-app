import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './invoice-note-dialog.component.html'
})
export class InvoiceNoteDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private readonly dialogRef: MatDialogRef<InvoiceNoteDialogComponent>,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public note: string
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({ note: this.note });
  }

  save(): void {
    this.dialogRef.close(this.form.value.note);
  }

  close(): void {
    this.dialogRef.close();
  }
}
