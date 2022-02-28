import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';
import { ProductVariant, ProspectProductCodes } from '@solargis/types/order-invoice';
import { ProspectLicense, ProspectLicenseType } from '@solargis/types/user-company';

import {
  ConfirmationDialogComponent,
  ConfirmationDialogMultiInput
} from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { selectIsUserLogged } from '../../../user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from '../../../user/selectors/company.selectors';
import { AuthenticationService } from '../../../user/services/authentication.service';
import { AddProductToCartAction } from '../../actions/cart.actions';
import { State } from '../../reducers';
import { ProductsService } from '../../services/product.service';
import { getProductNameTranslation } from '../../utils/products.utils';
import { table } from './pricing.table';


@Component({
  selector: 'sg-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent extends SubscriptionAutoCloseComponent implements OnInit {

  table = table;
  tableSpacing = ['35%', '5%', '20%', '20%', '20%'];

  isLoggedIn$: Observable<boolean>;

  license: ProspectLicense;
  licenseType: ProspectLicenseType;

  hasSelectedCompany: boolean;

  isDemoEnabled: boolean;
  isBasicOfferEnabled: boolean;
  isProOfferEnabled: boolean;

  basic: Product;
  pro: Product;
  upgrade: Product;

  proOffer: Product;
  loading = true;

  getProductNameTranslation = getProductNameTranslation;

  constructor(
    private readonly store: Store<State>,
    private readonly products: ProductsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthenticationService,
    private readonly dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.store.pipe(selectIsUserLogged);

    const license$ = this.store.pipe(
      selectActiveOrNoCompany,
      map(c => c.prospectLicense),
    );

    this.addSubscription(
      combineLatest([
        this.products.getProspectProducts(),
        license$
      ]).subscribe(
        ([products, license]) => {
          this.license = license;
          this.licenseType = this.license ? this.license.licenseType : ProspectLicenseType.FreeTrial;
          this.proOffer = this.licenseType === ProspectLicenseType.Basic ? this.upgrade : this.pro;

          this.isDemoEnabled = this.licenseType === ProspectLicenseType.FreeTrial;
          this.isBasicOfferEnabled = this.licenseType === ProspectLicenseType.FreeTrial;
          this.isProOfferEnabled = this.licenseType !== ProspectLicenseType.Pro;

          this.basic = products[ProspectProductCodes.PROSPECT_BASIC];
          this.pro = products[ProspectProductCodes.PROSPECT_PRO];
          this.upgrade = products[ProspectProductCodes.BASIC_TO_PRO];
          this.loading = false;
          this.proOffer = this.licenseType === ProspectLicenseType.Basic ? this.upgrade : this.pro;
        }
      )
    );

    this.addSubscription(
      this.store.pipe(selectActiveOrNoCompany).subscribe(
        company => this.hasSelectedCompany = !!company
      )
    );
  }

  getStarted(): void {
    this.authService.openRegistration();
  }

  addToCart(product: Product, openEditProductDialog: boolean = false): void {
    if (this.hasSelectedCompany) {
      const variant: ProductVariant = {
        code: product.code,
        totalUsers: product.code === ProspectProductCodes.BASIC_TO_PRO ?
        this.license.usersLimit : product.techSpec.autoProcessDefinition.usersLimit,
      };
      this.store.dispatch(new AddProductToCartAction(variant));
      const queryParams = openEditProductDialog ? { openEditProductDialog: 1 } : {};
      this.router.navigate(['..', 'cart'], { relativeTo: this.route, queryParams });
    } else {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          heading: 'payment.pricing.alert.heading',
          text: 'payment.pricing.alert.body',
          actions: [{
            default: true,
            text: 'common.action.close',
            value: false
          }]
        } as ConfirmationDialogMultiInput
      }).afterClosed().subscribe();
    }
  }

}
