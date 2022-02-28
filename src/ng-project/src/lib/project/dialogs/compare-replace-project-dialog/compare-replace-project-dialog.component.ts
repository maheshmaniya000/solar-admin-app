import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { EnergySystemRef } from '@solargis/types/project';

import { State } from '../../reducers';
import { selectCompareItems } from '../../selectors/compare.selectors';
import { CompareItem } from '../../types/compare.types';

@Component({
  selector: 'sg-compare-replace-project-dialog',
  templateUrl: './compare-replace-project-dialog.component.html',
  styleUrls: ['./compare-replace-project-dialog.component.scss']
})
export class CompareReplaceProjectDialogComponent implements OnInit {

  compare$: Observable<CompareItem[]>;
  selected: EnergySystemRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CompareReplaceProjectDialogComponent>,
    private readonly store: Store<State>
  ) { }

  ngOnInit(): void {
    this.compare$ = this.store.pipe(selectCompareItems);
  }

}
