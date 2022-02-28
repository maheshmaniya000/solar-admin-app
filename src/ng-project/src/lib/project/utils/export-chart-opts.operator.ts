import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataLayer } from '@solargis/dataset-core';
import { Project } from '@solargis/types/project';
import { PvConfig } from '@solargis/types/pv-config';

import { ProjectNamePipe } from '../pipes/project-name.pipe';
import { ExportChartOpts } from '../types/export-chart.types';

export function exportChartOptsOperator(layers: DataLayer | DataLayer[], projectNamePipe: ProjectNamePipe) {
  return (source: Observable<[Project, PvConfig]>): Observable<ExportChartOpts> =>
    source.pipe(
      map(([project, pvConfig]: [Project, PvConfig]) => ({
        layers,
        single: {
          projectName: projectNamePipe.transform(project),
          pvConfig
        }
      }))
    );
}
