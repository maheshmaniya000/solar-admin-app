import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Product } from '@solargis/types/customer';

@Component({
  selector: 'sg-admin-product-view',
  styleUrls: ['../../../shared/components/admin-common.styles.scss'],
  templateUrl: './product-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductViewComponent {
  @Input() product: Product;
}
