import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { EMPTY, MonoTypeOperatorFunction, Observable, of, pipe } from 'rxjs';
import { catchError, filter, finalize, first, map, switchMap, tap } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { AdminProductsService } from '../../shared/services/admin-products.service';
import { DetailNavigationService } from '../../shared/services/detail-navigation.service';
import { EntityDetailStore } from '../../shared/services/entity-detail.store';
import { AdminActions, fromAdmin } from '../../store';
import { ProductsActions } from '../store';

@Injectable()
export class ProductDetailStore extends EntityDetailStore<Product> {
  readonly create = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsertProduct('create')
    )
  );

  readonly update = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsertProduct('update')
    )
  );

  readonly deleteProduct = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.confirmDelete()),
      switchMap(() => this.entity$.pipe(first())),
      map(product => ({
        ...product,
        deleted: true
      })),
      this.upsertProduct('update'),
      tap(() => this.close())
    )
  );
  readonly toggleDisabled = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.entity$.pipe(first())),
      map(product => ({
        ...product,
        disabled: !product.disabled
      })),
      this.upsertProduct('update')
    )
  );

  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly store: Store<fromAdmin.State>,
    private readonly dialog: MatDialog,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super();
  }

  close(): void {
    this.detailNavigationService.close({ success: () => this.store.dispatch(ProductsActions.clearSelected()) });
  }

  isProductCodeAvailable(code: string): Observable<boolean> {
    return this.adminProductsService.getProduct(code).pipe(
      map(() => false),
      catchError(err => {
        if (err.error?.error === 'product.not_found') {
          return of(true);
        } else {
          this.showSnackbarMessage({
            message: 'Error during checking new product code',
            styleClass: 'snackbarError'
          });
          return of(false);
        }
      })
    );
  }

  private upsertProduct(operation: 'create' | 'update'): MonoTypeOperatorFunction<Product> {
    return pipe(
      tap(() => this.setUpdating(true)),
      switchMap(product =>
        (operation === 'create' ? this.adminProductsService.createProduct(product) : this.adminProductsService.updateProduct(product)).pipe(
          tap({
            next: updatedProduct => {
              this.clearChanges(updatedProduct);
              this.store.dispatch(ProductsActions.updated({ product: updatedProduct }));
              this.detailNavigationService.toProductAndSelect(updatedProduct);
              this.showSnackbarMessage({
                message: 'Product data has been saved',
                styleClass: 'snackbarPass'
              });
            },
            error: () =>
              this.showSnackbarMessage({
                message: 'Product data could NOT be saved',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdating(false))
        )
      )
    );
  }

  private confirmDelete(): Observable<boolean> {
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          heading: 'Product deletion',
          text: 'Do you really want to delete the product ?'
        }
      })
      .afterClosed()
      .pipe(filter(result => result === true));
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError' }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }
}
