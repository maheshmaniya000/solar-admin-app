import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { selectSelectedEnergySystem } from 'ng-project/project-detail/selectors';


export const selectSelectedSystemEconomyParameters = pipe(
  selectSelectedEnergySystem,
  map(system => system.economy),
);
