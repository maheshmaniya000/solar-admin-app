import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ComponentMode } from '../../../shared/models/component-mode.enum';
import { SaveableComponent } from '../../../shared/models/saveable-component.model';
import { fromAdmin } from '../../../store';
import { Orders } from '../../constants/orders.constants';
import { OrderDetailStore } from '../../services/order-detail.store';
import { OrdersSelectors } from '../../store';

@Component({
  selector: 'sg-admin-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  providers: [OrderDetailStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailComponent implements OnInit, SaveableComponent {
  readonly componentMode = ComponentMode;
  mode: ComponentMode;
  headerLabel: Record<ComponentMode, string> = {
    [ComponentMode.add]: 'Add order',
    [ComponentMode.view]: 'View order',
    [ComponentMode.edit]: 'Edit order'
  };
  private backLink: string;

  constructor(
    readonly orderDetailStore: OrderDetailStore,
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  hasUnsavedChanges(): Observable<boolean> {
    return this.orderDetailStore.unsavedChanges$;
  }

  ngOnInit(): void {
    this.mode = this.activatedRoute.snapshot.data.mode;
    if (this.mode !== ComponentMode.add) {
      this.orderDetailStore.setEntity(this.store.select(OrdersSelectors.selectSelected));
    } else {
      this.orderDetailStore.setEntity(history.state.order ?? Orders.createNew());
    }
    this.backLink = history.state.backLink ?? '/list/orders';
  }

  onCloseButtonClick(): void {
    this.mode === ComponentMode.view
      ? this.router.navigateByUrl(this.backLink)
      : this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
