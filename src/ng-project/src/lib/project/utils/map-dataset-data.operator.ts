import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AnyDataMap, DataResolution, VersionedDatasetDataMap } from '@solargis/types/dataset';

export function mapDatasetData(dataset: string, resolution: DataResolution) {
  return (source: Observable<VersionedDatasetDataMap>): Observable<AnyDataMap> => source.pipe(
      map(data => data
        && data[dataset]
        && data[dataset][resolution]
        && data[dataset][resolution].data)
    );
}
