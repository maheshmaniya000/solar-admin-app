import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

import { Dataset } from '@solargis/dataset-core';
import { Project } from '@solargis/types/project';
import { Company, CompanyWithToken } from '@solargis/types/user-company';

import { DateTimeFormatPipe } from 'ng-shared/shared/pipes/date-time-format.pipe';
import { downloadCSV } from 'ng-shared/shared/utils/download.utils';
import { selectCompanyList } from 'ng-shared/user/selectors/company.selectors';

import { ProjectToExport } from '../../project-list/types/sg1-ftp-export.types';
import { sg1FtpExportProjectsToCSV } from '../../project-list/utils/sg1-ftp-export-csv.utils';
import { ProjectNamePipe } from '../pipes/project-name.pipe';
import { LTA_PVCALC_COMBINED_DATASET } from './combined-dataset.factory';
import { DatasetAccessService } from './dataset-access.service';

@Injectable()
export class Sg1FtpExportProjectsService {

  constructor(
    private readonly datasetService: DatasetAccessService,
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly dateTimePipe: DateTimeFormatPipe,
    private readonly store: Store,
    @Inject(LTA_PVCALC_COMBINED_DATASET) private readonly dataset: Dataset
  ) {}

  exportProjects(projects: Project[]): Observable<ProjectToExport[]> {
    const projects$: Observable<ProjectToExport[]> = forkJoin(
      projects.map(p =>
        this.datasetService.dataLayersWithAccess$(this.dataset.annual, p).pipe(
          map(layerMap => ({ ...p, name: this.projectNamePipe.transform(p, 1000), layerMap })),
          first(),
        )
      )
    );
    const companies$: Observable<Company[]> = this.store.pipe(selectCompanyList).pipe(
      map((companies: CompanyWithToken[]) => companies.map(c => c.company)),
      first(),
    );

    return combineLatest([projects$, companies$]).pipe(
      map(([projectsToExport, companies]) => {
        const now = new Date();
        const parsedDate: string = this.dateTimePipe.transform(new Date(), 'dateTime') as string;
        const projectsToExportWithCompany = projectsToExport.map(project => {
          const company = companies.find(c => c.sgCompanyId === project.company?.sgCompanyId);
          return { ...project, company: { ...project.company, name: company?.name || project.company?.name } };
        });
        const file = sg1FtpExportProjectsToCSV(projectsToExportWithCompany, parsedDate);
        const fileNameDate = `${now.getFullYear()}-${('0' + now.getMonth()).slice(-2)}-${('0' + now.getDate()).slice(-2)}`;
        downloadCSV(file, `Solargis_Prospect_Export_${fileNameDate}.csv`);
        return projectsToExport;
      }),
      catchError(err => throwError(err)),
    );
  }
}
