import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Project } from '@solargis/types/project';

import { isProjectEligibleToClaimFreetrial } from './project-freetrial.utils';

export function projectToClaimFreetrial() {
  return (source: Observable<[Project, boolean]>): Observable<Project> => source.pipe(
      map(([project, freeTrialToClaim]) =>
        isProjectEligibleToClaimFreetrial(project) && freeTrialToClaim
          ? project
          : undefined
      )
    );
}
