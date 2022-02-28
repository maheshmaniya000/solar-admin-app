import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, first, map, switchMap } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';
import { ProspectProductCodes, ProductVariant } from '@solargis/types/order-invoice';

import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { ClearCartAction, UpdateCartAction, UpdateProductVariantAction } from '../../actions/cart.actions';
import { EditProductDialogComponent } from '../../components/edit-product-dialog/edit-product-dialog.component';
import { State } from '../../reducers';
import { selectCartProductVariants } from '../../selectors/cart.selectors';
import { ProductsService } from '../../services/product.service';
import { getproductVariantPrice } from '../../utils/price.utils';
import { getProductNameTranslation } from '../../utils/products.utils';


@Component({
  selector: 'sg-cart-step-one',
  templateUrl: './cart-step-one.component.html',
  styleUrls: ['./cart-step-one.component.scss']
})
export class CartStepOneComponent extends SubscriptionAutoCloseComponent implements OnInit {

  productsInCart$: Observable<{product: Product; price: number; productVariant: ProductVariant; users: number}[]>;
  totalPrice$: Observable<number>;

  purchaseOrderEnabled: boolean;
  form: FormGroup;

  getProductNameTranslation = getProductNameTranslation;

  prospectUpgradeCode = ProspectProductCodes.BASIC_TO_PRO;

  constructor(
    private readonly store: Store<State>,
    private readonly service: ProductsService,
    private readonly dialog: MatDialog,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    // purchase order form wiring
    this.form = this.fb.group({
      purchaseOrder: [undefined, []]
    });

    this.store.pipe(selectCartProductVariants, first()).subscribe(
      cart => {
        if (cart.purchaseOrder) {
          this.purchaseOrderEnabled = true;
          this.form.controls.purchaseOrder.setValue(cart.purchaseOrder);
        }
      }
    );

    this.addSubscription(
      this.form.valueChanges.pipe(
        debounceTime(100)
      ).subscribe(
        values => this.store.dispatch(new UpdateCartAction({ purchaseOrder: values.purchaseOrder }))
      )
    );

    // init
    this.productsInCart$ = combineLatest(
      this.store.pipe(selectCartProductVariants),
      this.service.getProspectProducts()
    ).pipe(
      map(([cart, products]) => cart.products.map(p => ({
        productVariant: p,
        product: products[p.code],
        price: getproductVariantPrice(p, products[p.code]),
        users: (p.totalUsers) || products[p.code].techSpec.autoProcessDefinition.usersLimit
      })))
    );

    this.totalPrice$ = this.store.pipe(
      selectCartProductVariants,
      switchMap(c => this.service.calculateCartProductsPrice(c.products))
    );

    this.route.queryParams.pipe(first()).subscribe(
      query => {
        if (query.openEditProductDialog) {
          // direct call causes ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => this.edit(0));
        }
      }
    );
  }

  purchaseOrderCheckboxChange(change: MatCheckboxChange): void {
    this.purchaseOrderEnabled = change.checked;
    if (!change.checked) {this.store.dispatch(new UpdateCartAction({ purchaseOrder: null }));}
  }

  clear(): void {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        text: 'payment.cart.step1.remove'
      }
    }).afterClosed().pipe(filter(x => !!x)).subscribe(
      () => this.store.dispatch(new ClearCartAction())
    );
  }

  edit(productIndex: number): void {
    combineLatest(
      this.store.pipe(selectCartProductVariants),
      this.service.getProspectProducts()
    ).pipe(
      first(),
      switchMap(([cart, products]) =>
        this.dialog.open(EditProductDialogComponent, {
          minWidth: '750px',
          data: {
            product: products[cart.products[productIndex].code],
            productVariant: cart.products[productIndex]
          }
        }).afterClosed()
      ),
      filter(x => !!x)
    ).subscribe(
      (p: ProductVariant) => this.store.dispatch(new UpdateProductVariantAction(productIndex, p))
    );
  }

}
