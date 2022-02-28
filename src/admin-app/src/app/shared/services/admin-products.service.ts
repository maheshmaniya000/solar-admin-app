import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product, ProductListRequest } from '@solargis/types/customer';
import { removeEmpty } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';

import { xslxExport } from '../admin.utils';

@Injectable({
  providedIn: 'root'
})
export class AdminProductsService {
  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  listProducts(includeDisabled: boolean): Observable<Product[]> {
    const params = includeDisabled ? { includeDisabled: '1' } : {};
    return this.http.get<Product[]>(
      `${this.config.api.customerUrl}/admin/product`,
      { params }
    );
  }

  getProduct(code: string): Observable<Product> {
    return this.http.get<Product>(
      `${this.config.api.customerUrl}/admin/product/${code}`
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(
      `${this.config.api.customerUrl}/admin/product`,
      removeEmpty(product)
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.patch<Product>(
      `${this.config.api.customerUrl}/admin/product/${product.code}`,
      removeEmpty(product)
    );
  }

  exportProductsXlsx(includeDisabled: boolean, selected?: string[]): Observable<void> {
    const request: ProductListRequest = { filter: { includeDisabled } };
    if (selected?.length) {
      request.filter.code = selected;
    }
    return xslxExport({
      request, http: this.http, url: `${this.config.api.customerUrl}/admin/export/product`, label: 'Products'
    });
  }
}
