import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';

import { Order, OrderWithoutInvoices } from '@solargis/types/customer';
import { Product } from '@solargis/types/customer';
import { Company, User } from '@solargis/types/user-company';

import { CompaniesActions } from '../../companies/store';
import { OrdersActions } from '../../orders/store';
import { ProductsActions } from '../../products/store';
import { fromAdmin } from '../../store';

export interface AfterDetailNavigation {
  success?: () => void;
  always?: () => void;
}

@Injectable({ providedIn: 'root' })
export class DetailNavigationService {
  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  toUser(user: User, afterNavigation?: AfterDetailNavigation): void {
    this.router.navigate(['/list/users', user.sgAccountId])
      .then(success => this.executeAfterNavigation(afterNavigation, success));
  }

  toCompany(company: Company, afterNavigation?: AfterDetailNavigation): void {
    this.router.navigate(['/list/companies', company.sgCompanyId]).then(success => this.executeAfterNavigation(afterNavigation, success));
  }

  toSubscription(subscription: any, afterNavigation?: AfterDetailNavigation): void {
    this.router.navigate([`/list/companies/sg2%7C11726`, subscription.id])
    .then(success => this.executeAfterNavigation(afterNavigation, success));
  }

  toViewtokens(subscription: any, afterNavigation?: AfterDetailNavigation): void {
    this.router.navigate([`/list/companies/sg2%7C11726/1`, subscription])
    .then(success => this.executeAfterNavigation(afterNavigation, success));
  }

  toCompanyAndSelect(company: Company): void {
    this.toCompany(company, {
      success: () => {
        setTimeout(() => {
          document.querySelector('.max-full-screen').scrollBy({ left: 1000 });
        }, 100);
        this.store.dispatch(CompaniesActions.select({ company }));
      }
    });
  }

  toEditCompany(company: Company): void {
    this.navigateTo(['company', company.sgCompanyId, 'edit'], {
      success: () => this.store.dispatch(CompaniesActions.select({ company }))
    });
  }

  toProduct(product: Product, afterNavigation?: AfterDetailNavigation): void {
    this.navigateTo(['product', product.code], afterNavigation);
  }

  toProductAndSelect(product: Product): void {
    this.toProduct(product, {
      success: () => {
        this.store.dispatch(ProductsActions.select({ product }));
        setTimeout(() => {
          document.querySelector('.max-full-screen').scrollBy({ left: 1000 });
        }, 100);
      }
    });
  }

  toAddProduct(): void {
    this.navigateTo(['product', 'add'], {
      success: () => this.store.dispatch(ProductsActions.clearSelected())
    });
  }

  toOrderAndSelect(order: Order, backLink?: string): void {
    this.toOrder(order, backLink, {
      success: () => this.store.dispatch(OrdersActions.select({ order }))
    });
  }

  toOrder(order: OrderWithoutInvoices, backLink?: string, afterNavigation?: AfterDetailNavigation): void {
    this.router
      .navigate(['/list/orders', order.sgOrderId], { state: { backLink } })
      .then(success => this.executeAfterNavigation(afterNavigation, success));
  }

  toAddOrder(order?: Order): void {
    this.router.navigate(['/list/orders/add'], { state: { order: this.createOrderCopy(order) } });
  }

  close(afterNavigation?: AfterDetailNavigation): void {
    this.navigateTo(null, afterNavigation);
  }

  private navigateTo(
    command: null | ['user' | 'company' | 'product', ...any[]],
    afterNavigation: {
      success?: () => void;
      always?: () => void;
    } = {}
  ): void {
    this.router
      .navigate([{ outlets: { detail: command } }], {
        relativeTo: this.activatedRoute.root.children[0]
      })
      .then(success => this.executeAfterNavigation(afterNavigation, success));
  }

  private executeAfterNavigation(afterNavigation: AfterDetailNavigation, success: boolean): void {
    if (success) {
      afterNavigation?.success?.();
    }
    afterNavigation?.always?.();
  }

  private createOrderCopy(order: Order): Partial<Order> | undefined {
    if (isNil(order)) {
      return undefined;
    }
    return {
      company: order.company,
      VAT_ID: order.VAT_ID,
      sgCompanyId: order.sgCompanyId,
      contacts: order.contacts,
      currency: order.currency,
      discount: order.discount,
      orderItems: order.orderItems.map(item => ({ ...item, processed: undefined})),
      orderTitle: order.orderTitle,
      orderTitleSK: order.orderTitleSK,
      originSystem: order.originSystem,
      price: order.price,
      quantity: order.quantity,
      purchaseOrderNo: order.purchaseOrderNo,
      contractNo: order.contractNo,
      phone: order.phone,
      note: order.note,
      freeText: order.freeText,
      deleted: false
    };
  }
}
