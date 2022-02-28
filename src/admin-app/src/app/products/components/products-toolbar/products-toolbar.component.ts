import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { fromAdmin } from '../../../store';
import { ProductsActions, ProductsSelectors } from '../../store';

@Component({
  selector: 'sg-admin-products-toolbar',
  templateUrl: './products-toolbar.component.html'
})
export class ProductsToolbarComponent implements OnInit {
  onlyEnabled$: Observable<boolean>;

  constructor(private readonly store: Store<fromAdmin.State>, private readonly detailNavigationService: DetailNavigationService) {}

  ngOnInit(): void {
    this.onlyEnabled$ = this.store.select(ProductsSelectors.selectIncludeDisabled).pipe(map(includeDisabled => !includeDisabled));
  }

  onOnlyEnabledChange($event: MatSlideToggleChange): void {
    this.store.dispatch(ProductsActions.changeFilter({ includeDisabled: !$event.checked }));
  }

  onCreateNewClick(): void {
    this.detailNavigationService.toAddProduct();
  }

  exportProductList(): void {
    this.store.dispatch(ProductsActions.exportList());
  }
}
