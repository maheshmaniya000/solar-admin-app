import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ComponentMode } from '../../../shared/models/component-mode.enum';
import { SaveableComponent } from '../../../shared/models/saveable-component.model';
import { fromAdmin } from '../../../store';
import { ProductDetailStore } from '../../services/product-detail.store';
import { ProductsSelectors } from '../../store';

@Component({
  styleUrls: ['../../../shared/components/admin-common.styles.scss', './product-detail.component.scss'],
  templateUrl: './product-detail.component.html',
  providers: [ProductDetailStore]
})
export class ProductDetailComponent implements OnInit, SaveableComponent {
  readonly componentMode = ComponentMode;
  mode: ComponentMode;

  constructor(
    readonly productDetailStore: ProductDetailStore,
    private readonly store: Store<fromAdmin.State>,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mode = this.activatedRoute.snapshot.data.mode;
    if (this.mode !== ComponentMode.add) {
      this.productDetailStore.setEntity(this.store.select(ProductsSelectors.selectSelected));
    }
  }

  hasUnsavedChanges(): Observable<boolean> {
    return this.productDetailStore.unsavedChanges$;
  }
}
