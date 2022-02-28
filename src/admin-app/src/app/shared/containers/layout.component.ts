import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ResizeEvent } from 'angular-resizable-element';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { selectRouteDataFullscreen } from 'ng-shared/core/selectors/route-data.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectIsUserAdmin } from 'ng-shared/user/selectors/permissions.selectors';

import { fromAdmin } from '../../store';

interface ResizeStyle {
  left?: string;
  width?: string;
  display: 'block' | 'none';
}

@Component({
  selector: 'sg-admin-layout',
  styleUrls: ['./layout.component.scss'],
  templateUrl: './layout.component.html'
})
export class LayoutComponent extends SubscriptionAutoCloseComponent implements OnInit, OnDestroy {
  noFullscreen$: Observable<boolean>;
  resizeStyle: ResizeStyle = { display: 'none' };

  constructor(private readonly store: Store<fromAdmin.State>, private readonly router: Router) {
    super();
  }

  ngOnInit(): void {
    this.noFullscreen$ = this.store.pipe(
      selectRouteDataFullscreen,
      map(fullscreen => !fullscreen)
    );
    // TODO move this logic to effect
    this.addSubscription(
      this.store.pipe(selectIsUserAdmin).subscribe(isAdmin => {
        if (!isAdmin) {
          this.router.navigate(['']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX = 385;
    const MAX_DIMENSIONS_PX = 800;
    if (event.rectangle.width && (event.rectangle.width < MIN_DIMENSIONS_PX || event.rectangle.width > MAX_DIMENSIONS_PX)) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent): void {
    this.resizeStyle = {
      ...this.resizeStyle,
      left: `${event.rectangle.left}px`,
      width: `${event.rectangle.width}px`
    };
  }

  detailActivated(activated: boolean): void {
    this.resizeStyle = {
      ...this.resizeStyle,
      display: activated ? 'block' : 'none'
    };
  }
}
