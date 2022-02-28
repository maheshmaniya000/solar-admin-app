import { Inject, Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, throwError } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

import { Dataset } from '@solargis/dataset-core';
import { combineDataArray } from '@solargis/types/dataset';

import { selectSelectedEnergySystemProject, selectSelectedProjectAppData } from 'ng-project/project-detail/selectors';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { LTA_PVCALC_COMBINED_DATASET } from 'ng-project/project/services/combined-dataset.factory';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { downloadCSV } from 'ng-shared/shared/utils/download.utils';

import { getProjectPvSystDataCSV, ProjectDataCsvOptions } from '../utils/project-pvsyst-data-csv.utils';

@Injectable()
export class ProjectPvSystDataCsvService {

  constructor(
    private readonly transloco: TranslocoService,
    private readonly store: Store<State>,
    private readonly datasetService: DatasetAccessService,
    private readonly projectNamePipe: ProjectNamePipe,
    @Inject(LTA_PVCALC_COMBINED_DATASET) private readonly dataset: Dataset
  ) {}

  exportPvSystData(lang: string): Observable<any> {
    const projectPvSystem$ = this.store.pipe(selectSelectedEnergySystemProject);
    return combineLatest([
      projectPvSystem$,
      this.store.pipe(selectSelectedProjectAppData, map(({ lta, pvcalcDetails }) => combineDataArray(lta, pvcalcDetails))),
      this.datasetService.dataLayersWithAccess$(this.dataset.annual, projectPvSystem$),
      this.datasetService.dataLayersWithAccess$(this.dataset.monthly, projectPvSystem$)
    ]).pipe(
      first(),
      map(([project, projectData, annualLayerMap, monthlyLayerMap]) => {
        const projectName = this.projectNamePipe.transform(project);
        const opts: ProjectDataCsvOptions = {
          project,
          projectName,
          projectData,
          annualLayerMap,
          monthlyLayerMap,
          translateLang: lang
        };
        const file = getProjectPvSystDataCSV(opts, this.transloco);
        downloadCSV(file, `Solargis_Prospect_${projectName}.csv`);
      }),
      catchError(err => throwError(err)),
    );
  }
}
