import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, merge } from 'rxjs';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs/operators';

import { State } from '../../reducers';
import { selectCartProductVariants } from '../../selectors/cart.selectors';


@Component({
  selector: 'sg-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  step$: Observable<number>;
  hasOrder$: Observable<boolean>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.step$ = merge(
      this.route.url,
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)) // route changes on path
    ).pipe(
      map(() => this.route.firstChild.routeConfig.path),
      startWith('1'),
      map(x => parseInt(x, 10)),
      distinctUntilChanged()
    );

    this.hasOrder$ = this.store.pipe(
      selectCartProductVariants
    ).pipe(
      map(order => order && order.products && order.products.length > 0)
    );


  }

}
