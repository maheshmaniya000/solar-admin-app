import { DataSource } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';

export function getOrderYear(o: Order): number {
  return (new Date(o.author.ts)).getFullYear();
}

/**
 * Data source for users (master DB).
 */
export class BillingOrdersDataSource extends DataSource<Order> {

  filteredOrders$: Observable<Order[]>;

  constructor(
    private readonly orders$: Observable<Order[]>,
    private readonly pageEvent$: BehaviorSubject<PageEvent>,
    private readonly PAGE_SIZE: number,
    private readonly yearFilter$: BehaviorSubject<number>,
    private readonly sort$: BehaviorSubject<Sort>,
  ) {
    super();

    this.filteredOrders$ = combineLatest(
      this.orders$,
      this.yearFilter$
    ).pipe(
      map(([orders, yearFilter]) => {
        if (yearFilter !== -1) {
          return orders.filter(o => getOrderYear(o) === yearFilter);
        } else {return orders;}
      }),
    );
  }

  getCount(): Observable<number> {
    return this.filteredOrders$.pipe(
      map(orders => orders && orders.length)
    );
  }

  connect(): Observable<Order[]> {
    return combineLatest(
      this.filteredOrders$,
      this.pageEvent$,
      this.sort$
    ).pipe(
      map(([orders, pageEvent, sort]) => {
        let result = [...orders];

        // sort
        if (sort && sort.active === 'date' && sort.direction.length) {
          const f = sort.direction === 'desc' ?
            (a: Order, b: Order) => a.author.ts - b.author.ts :
            (a: Order, b: Order) => b.author.ts - a.author.ts;
          result.sort(f);
        }

        // paginate
        const page = pageEvent ? pageEvent.pageIndex : 0;
        result = result.slice(page * this.PAGE_SIZE, (page + 1) * this.PAGE_SIZE);

        return result;
      }),
      distinctUntilChanged(),
    );
  }

  disconnect(): void {
    // do nothing
  }
}
