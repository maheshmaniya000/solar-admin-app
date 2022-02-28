import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProjectListRequest, ProjectListResponse } from '@solargis/types/project';

import { Config } from 'ng-shared/config';

@Injectable()
export class ProjectListLoadService {
  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  load(request: ProjectListRequest = {}): Observable<ProjectListResponse> {
    return this.http.put<ProjectListResponse>(this.config.api.projectUrl, request);
  }
}
