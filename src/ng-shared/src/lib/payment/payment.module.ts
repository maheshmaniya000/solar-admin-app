import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';

import { SharedModule } from '../shared/shared.module';
import { HasSelectedCompanyGuard } from '../user/guards/has-selected-company.guard';
import { LoginUserGuard } from '../user/guards/login-user.guard';
import { BankTransferPaymentComponent } from './components/bank-transfer-payment/bank-transfer-payment.component';
import { BraintreeDropinComponent } from './components/braintree-dropin/braintree-dropin.component';
import { CartCompanyRecapComponent } from './components/cart-company-recap/cart-company-recap.component';
import { CartProductsRecapComponent } from './components/cart-products-recap/cart-products-recap.component';
import { EditProductDialogComponent } from './components/edit-product-dialog/edit-product-dialog.component';
import { PaymentFailedComponent } from './components/payment-failed/payment-failed.component';
import { PaymentThankYouComponent } from './components/payment-thank-you/payment-thank-you.component';
import { PaymentWrapperComponent } from './components/payment-wrapper/payment-wrapper.component';
import { SelectPaymentMethodComponent } from './components/select-payment-method/select-payment-method.component';
import { CartStepOneComponent } from './containers/cart-step-one/cart-step-one.component';
import { CartStepThreeComponent } from './containers/cart-step-three/cart-step-three.component';
import { CartStepTwoComponent } from './containers/cart-step-two/cart-step-two.component';
import { CartComponent } from './containers/cart/cart.component';
import { PaymentDialogComponent } from './containers/payment-dialog/payment-dialog.component';
import { PaymentStatusDialogComponent } from './containers/payment-status-dialog/payment-status-dialog.component';
import { PricingComponent } from './containers/pricing/pricing.component';
import { CartEffects } from './effects/cart.effects';
import { paymentReducer } from './reducers';
import { PaymentService } from './services/payment.service';
import { ProductsService } from './services/product.service';


@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([ CartEffects ]),
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    RouterModule.forChild([
      {
        path: 'pricing',
        component: PricingComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
        canActivate: [
          LoginUserGuard,
          HasSelectedCompanyGuard,
        ],
        children: [
          {
            path: '1',
            component: CartStepOneComponent
          },
          {
            path: '2',
            component: CartStepTwoComponent
          },
          {
            path: '3',
            component: CartStepThreeComponent
          },
          { path: '', pathMatch: 'full', redirectTo: '1' }
        ]
      },
      { path: '*', redirectTo: 'pricing' },
    ]),
    ReactiveFormsModule,
    SharedModule,
    StoreModule.forFeature('payment', paymentReducer),
    UserSharedModule
  ],
  declarations: [
    BankTransferPaymentComponent,
    BraintreeDropinComponent,
    CartComponent,
    CartCompanyRecapComponent,
    CartProductsRecapComponent,
    CartStepOneComponent,
    CartStepTwoComponent,
    CartStepThreeComponent,
    EditProductDialogComponent,
    PaymentDialogComponent,
    PaymentThankYouComponent,
    PaymentFailedComponent,
    PaymentStatusDialogComponent,
    PaymentWrapperComponent,
    PricingComponent,
    SelectPaymentMethodComponent,
  ],
  providers: [
    PaymentService,
    HasSelectedCompanyGuard,
    ProductsService,
  ],
  entryComponents: [
    PaymentDialogComponent,
    EditProductDialogComponent,
    PaymentStatusDialogComponent,
  ],
  exports: [
    PaymentDialogComponent,
    PaymentStatusDialogComponent,
  ]
})
export class PaymentModule { }
