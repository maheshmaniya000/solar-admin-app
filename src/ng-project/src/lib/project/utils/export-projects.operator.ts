import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { Project } from '@solargis/types/project';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { ProjectToExport } from '../../project-list/types/sg1-ftp-export.types';
import { ExtendedProject } from '../reducers/projects.reducer';
import { Sg1FtpExportProjectsService } from '../services/sg1-ftp-export-projects.service';

export function exportProjectsOperator(dialog: MatDialog, exportService: Sg1FtpExportProjectsService) {
  return (source: Observable<[ExtendedProject[], Project]>): Observable<AmplitudeTrackEvent> => source.pipe(
      switchMap(([projects, project]: [ExtendedProject[], Project]) => dialog.open(ConfirmationDialogComponent, {
          data: {
            heading: 'export.title',
            text: 'export.confirmText',
            action: 'common.confirm.yes',
            noAction: 'common.confirm.no',
          },
        }).afterClosed().pipe(
          switchMap(result => result
            ? exportService.exportProjects(projects && projects.length > 0 ? projects : [project])
            : of(null)
          )
        )),
      filter(res => !!res),
      map((res: ProjectToExport[]) => new AmplitudeTrackEvent('project_export', { count: res.length }))
    );
}
