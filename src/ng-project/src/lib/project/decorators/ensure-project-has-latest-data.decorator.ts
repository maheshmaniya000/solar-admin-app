import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';

import { ensureSelectedEnergySystemHasLatestData } from '../../utils/latest-data.utils';
import { State } from '../reducers';

interface StoreAwareComponent {
  store: Store<State>;
}

export function ensureProjectHasLatestData(
  target: StoreAwareComponent,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  descriptor.value = function(this: StoreAwareComponent): void {
    ensureSelectedEnergySystemHasLatestData(this.store, 'prospect')
      .pipe(filter(isLatest => isLatest))
      .subscribe(() => originalMethod.call(this));
  };
  return descriptor;
}
