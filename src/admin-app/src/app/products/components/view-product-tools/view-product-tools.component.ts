import { Component } from '@angular/core';

import { ProductDetailStore } from '../../services/product-detail.store';

@Component({
  selector: 'sg-admin-view-product-tools',
  templateUrl: './view-product-tools.component.html'
})
export class ViewProductToolsComponent {
  constructor(readonly productDetailStore: ProductDetailStore) {}
}
