import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Project, ProjectId } from '@solargis/types/project';

import { Config } from 'ng-shared/config';

export type ProjectLoadResult = { err?: any; projectId: ProjectId; project?: Project };

@Injectable()
export class ProjectLoadService {

  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  loadProject(projectId: ProjectId): Observable<ProjectLoadResult> {
    return this.http.get(`${this.config.api.projectUrl}/${projectId}`).pipe(
      map(project => ({ project, projectId } as ProjectLoadResult)),
      catchError(err => of({ err, projectId } as ProjectLoadResult)),
    );
  }

}
