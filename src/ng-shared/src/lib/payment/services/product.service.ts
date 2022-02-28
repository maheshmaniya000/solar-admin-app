import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';
import { ProductVariant } from '@solargis/types/order-invoice';
import { ensureArray } from '@solargis/types/utils';

import { Config } from '../../config';
import { ProductMap } from '../payment.types';
import { getProductVariantsPrice } from '../utils/price.utils';

/**
 * Service providing API for admin product API
 */
@Injectable()
export class ProductsService {

  private readonly prospectProducts$: Observable<ProductMap>;

  constructor(
    private readonly http: HttpClient,
    private readonly config: Config
  ) {

    this.prospectProducts$ = http.get(`${config.api.customerUrl}/product/purchase`).pipe(
      map((products: Product[]) => products.reduce((acc, cur) => {
          acc[cur.code] = cur;
          return acc;
        }, {})),
      publishReplay(),
      refCount(),
    );
  }

  getProspectProducts(): Observable<ProductMap> {
    return this.prospectProducts$;
  }

  calculateCartProductsPrice(productVariants: ProductVariant | ProductVariant[]): Observable<number> {
    return this.prospectProducts$.pipe(
      map(prospectProducts => getProductVariantsPrice(ensureArray(productVariants), prospectProducts))
    );
  }

}
