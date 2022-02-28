import { Component } from '@angular/core';

import { ProductDetailStore } from '../../services/product-detail.store';

@Component({
  selector: 'sg-admin-edit-product-tools',
  templateUrl: './edit-product-tools.component.html'
})
export class EditProductToolsComponent {
  constructor(readonly productDetailStore: ProductDetailStore) {}
}
