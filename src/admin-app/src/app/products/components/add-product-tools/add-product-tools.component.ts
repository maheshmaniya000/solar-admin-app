import { Component } from '@angular/core';

import { ProductDetailStore } from '../../services/product-detail.store';

@Component({
  selector: 'sg-admin-add-product-tools',
  templateUrl: './add-product-tools.component.html'
})
export class AddProductToolsComponent {
  constructor(readonly productDetailStore: ProductDetailStore) {}
}
