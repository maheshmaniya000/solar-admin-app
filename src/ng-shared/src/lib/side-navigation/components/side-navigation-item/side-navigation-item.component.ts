import { Component, Input, EventEmitter, Output } from '@angular/core';

import { SideNavigationRoute } from '../../../shared/types';

@Component({
  selector: 'sg-side-navigation-item',
  templateUrl: './side-navigation-item.component.html',
  styleUrls: ['./side-navigation-item.component.scss']
})
export class SideNavigationItemComponent {

  @Input() route: SideNavigationRoute;
  @Input() isLocked: boolean;
  @Input() isActive: boolean;
  @Input() isExpanded: boolean;
  @Input() isChild: boolean;
  @Input() hasChildren: boolean;

  @Output() onClick = new EventEmitter();
  @Output() openLockerModal = new EventEmitter();
  @Output() onClickArrow = new EventEmitter();

  click(event): void {
    if (!this.isLocked) {
      this.onClick.emit(event);
    } else {
      this.openLockerModal.emit(this.route);
    }
  }

  clickOnArrow(event): void {
    event.stopPropagation();
    if (!this.isLocked) {this.onClickArrow.emit(event);}
  }
}
