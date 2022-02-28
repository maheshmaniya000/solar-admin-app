import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';
import { ProductVariant } from '@solargis/types/order-invoice';

import { pvConfigDivider } from '../../../utils/misc';
import { State } from '../../reducers';
import { selectCartProductVariants } from '../../selectors/cart.selectors';
import { ProductsService } from '../../services/product.service';
import { getproductVariantPrice } from '../../utils/price.utils';
import { getProductNameTranslation } from '../../utils/products.utils';


@Component({
  selector: 'sg-cart-products-recap',
  templateUrl: './cart-products-recap.component.html',
  styleUrls: ['./cart-products-recap.component.scss']
})
export class CartProductsRecapComponent implements OnInit {

  products$: Observable<{ product: Product; productVariant: ProductVariant; price: number; users: number }[]>;

  divider = pvConfigDivider;
  getProductNameTranslation = getProductNameTranslation;

  constructor(
    private readonly store: Store<State>,
    private readonly service: ProductsService,
  ) { }

  ngOnInit(): void {
    this.products$ = combineLatest([
      this.store.pipe(selectCartProductVariants),
      this.service.getProspectProducts()
    ]).pipe(
      map(([cart, products]) => cart.products.map(p => ({
        productVariant: p,
        product: products[p.code],
        price: getproductVariantPrice(p, products[p.code]),
        users: (p.totalUsers) || products[p.code].techSpec.autoProcessDefinition.usersLimit
      })))
    );
  }
}
