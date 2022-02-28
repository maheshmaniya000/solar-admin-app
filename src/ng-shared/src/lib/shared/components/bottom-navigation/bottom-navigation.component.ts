import { Component, Input, OnChanges, EventEmitter, Output } from '@angular/core';

import { SideNavigationRoute } from '../../types';


@Component({
  selector: 'sg-bottom-navigation',
  templateUrl: './bottom-navigation.component.html',
  styleUrls: ['./bottom-navigation.component.scss']
})
export class BottomNavigationComponent implements OnChanges {

  @Input() path: string;
  @Input() routes: SideNavigationRoute[];
  @Input() allowedPaths?: {[key: string]: boolean};

  @Output() onSelect = new EventEmitter<SideNavigationRoute>();

  prev: SideNavigationRoute;
  next: SideNavigationRoute;

  nextParent: SideNavigationRoute;
  prevParent: SideNavigationRoute;

  ngOnChanges(): void {
    if (this.path && this.routes) {
      const index = this.routes.findIndex(r => r.path === this.path);

      // prev
      let i = index - 1;
      while (i > 0 && (!this.isAllowedPath([this.routes[i].path]) || this.routes[i].data.empty)) {i--;}
      if (i >= 0) {this.prev = this.routes[i];}
      else {this.prev = null;}
      this.prevParent = this.routes.find(route => this.prev && route.path === this.prev.data.parent);

      // next
      i = index + 1;
      while (i < this.routes.length && (!this.isAllowedPath([this.routes[i].path]) || this.routes[i].data.empty)) {i++;}
      if (i < this.routes.length) {this.next = this.routes[i];}
      else {this.next = null;}
      this.nextParent = this.routes.find(route => this.next && route.path === this.next.data.parent);
    }
  }

  isAllowedPath(path: any): boolean {
    return this.allowedPaths ? this.allowedPaths[path] : true;
  }
}
