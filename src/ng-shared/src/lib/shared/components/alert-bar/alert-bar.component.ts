import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action } from '@ngrx/store';

import { Alert, AlertClickAction } from '../../../core/types';

@Component({
  selector: 'sg-alert-bar',
  templateUrl: './alert-bar.component.html',
  styleUrls: ['./alert-bar.component.scss']
})
export class AlertBarComponent {
  @Input() alert: Alert;

  @Output() dispatch = new EventEmitter<Action>();
  @Output() closeAlertBar = new EventEmitter<void>();

  click(): void  {
    this.executeClick(this.alert.click);
  }

  secondaryClick(): void  {
    this.executeClick(this.alert.secondaryClick);
  }

  closeClick(): void  {
    this.executeClick(this.alert.closeClick);
    this.closeAlertBar.emit();
  }

  private executeClick(click: AlertClickAction): void {
    if(!click) {
      return;
    }
    if (click.href) {
      window.open(click.href, '_blank');
    }
    if (click.dispatchOnClick) {
      this.dispatch.emit(click.dispatchOnClick);
    }
    if (click.clickFn) {
      click.clickFn();
    }
    if (click.closeAlertOnClick) {
      this.closeAlertBar.emit();
    }
  }
}
