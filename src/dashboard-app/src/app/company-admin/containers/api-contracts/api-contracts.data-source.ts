import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APIContract } from '@solargis/types/api/contract';

/**
 * Data source for API contracts.
 */
export class ApiContractsDataSource extends DataSource<APIContract> {

  constructor(private readonly apiContracts$: Observable<APIContract[]>) {
    super();
  }

  getCount(): Observable<number> {
    return this.apiContracts$.pipe(
      map(apiContracts => apiContracts && apiContracts.length)
    );
  }

  connect(): Observable<APIContract[]> {
    return this.apiContracts$;
  }

  disconnect(): void {
    // do nothing
  }
}
