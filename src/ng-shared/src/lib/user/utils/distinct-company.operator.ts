import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export function distinctByCompanyId<T extends {sgCompanyId: string}>(): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> => source.pipe(
    distinctUntilChanged((value1, value2) => value1 === value2 || (value1 && value2 && value1.sgCompanyId === value2.sgCompanyId))
  );
}
