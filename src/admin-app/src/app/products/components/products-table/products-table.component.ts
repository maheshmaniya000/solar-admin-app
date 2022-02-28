import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEmpty } from 'lodash-es';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { fromAdmin } from '../../../store';
import { ProductsActions, ProductsSelectors } from '../../store';

@Component({
  selector: 'sg-admin-products-table',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', '../../../shared/components/admin-tab.styles.scss'],
  templateUrl: './products-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsTableComponent extends SubscriptionAutoCloseComponent implements OnInit {
  multiselect$: Observable<string[]>;
  allSelected$: Observable<boolean>;
  products$: Observable<Product[]>;
  selected$: Observable<Product>;

  form: FormGroup;
  columns = ['checkbox', 'code', 'category', 'title', 'descriptionEN', 'descriptionSK', 'price'];
  selection = new SelectionModel<string>(true);

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormBuilder().group({});
    this.store.dispatch(ProductsActions.loadProducts());
    this.products$ = this.store.select(ProductsSelectors.selectAll);
    this.selected$ = this.store.select(ProductsSelectors.selectSelected);
    this.multiselect$ = this.store.select(ProductsSelectors.selectMultiselect);
    this.allSelected$ = this.store.select(ProductsSelectors.selectAllSelected);
    this.addSubscription(
      this.multiselect$.subscribe(selection => isEmpty(selection) ? this.selection.clear() : this.selection.select(...selection))
    );
    this.addSubscription(this.selection.changed.pipe(
      distinctUntilChanged(isEqual)
    ).subscribe(() => this.store.dispatch(ProductsActions.multiselect({ ids: this.selection.selected }))));
  }

  onRowClicked(product: Product): void {
    this.detailNavigationService.toProductAndSelect(product);
  }

  onSelectAllClick(event: MouseEvent): void {
    event.preventDefault();
    this.store.dispatch(this.selection.hasValue() ? ProductsActions.multiselectClear() : ProductsActions.multiselectToggleAll());
  }
}
