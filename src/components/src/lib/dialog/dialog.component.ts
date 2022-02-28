import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import { MatDialogActions } from '@angular/material/dialog';
import { isNil } from 'lodash-es';
import { isObservable,  of } from 'rxjs';

import { DialogConstants } from './dialog.constants';
import { DialogFooterDirective } from './footer-content/dialog-footer.directive';
import { DialogActions } from './model/dialog-action.model';

@Component({
  selector: 'sg-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent implements OnInit, OnChanges, AfterContentChecked {
  @Input() titleTranslationKey: string;
  @Input() dividedContent = false;
  @Input() closeIconButtonEnabled = false;
  @Input() actions: DialogActions;
  @ContentChild(MatDialogActions) actionsDirective: MatDialogActions;
  @ContentChild(DialogFooterDirective)
  footer: DialogFooterDirective;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(): void {
    if (isNil(this.actions)) {
      this.actions = of([
        DialogConstants.actions.cancel,
        DialogConstants.actions.ok
      ]);
    }
    this.actions = isObservable(this.actions) ? this.actions : of(this.actions);
  }

  ngOnInit(): void {
    this.ngOnChanges();
  }

  ngAfterContentChecked(): void {
    this.changeDetectorRef.markForCheck();
  }
}
