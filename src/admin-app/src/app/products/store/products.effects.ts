import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { AdminProductsService } from '../../shared/services/admin-products.service';
import { fromAdmin } from '../../store';
import { ProductsActions, ProductsSelectors } from './index';

@Injectable()
export class ProductsEffects {
  updateFilter$ = createEffect(() => this.actions$.pipe(ofType(ProductsActions.changeFilter), map(ProductsActions.loadProducts)));

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      withLatestFrom(this.store.select(ProductsSelectors.selectIncludeDisabled)),
      switchMap(([, includeDisabled]) =>
        this.adminProductsService.listProducts(includeDisabled).pipe(
          map(products => ProductsActions.loadProductsSuccess({ products })),
          catchError(() => of(ProductsActions.loadProductsFailure))
        )
      )
    )
  );

  xlsxExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.exportList),
      withLatestFrom(
        this.store.select(ProductsSelectors.selectIncludeDisabled),
        this.store.select(ProductsSelectors.selectMultiselect)
      ),
      switchMap(([, includeDisabled, selected]) => this.adminProductsService.exportProductsXlsx(includeDisabled, selected))
    ), { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly adminProductsService: AdminProductsService,
    private readonly store: Store<fromAdmin.State>
  ) {}
}
