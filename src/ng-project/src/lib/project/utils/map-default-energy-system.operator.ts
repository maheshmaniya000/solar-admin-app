import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnergySystemRef, getProjectDefaultSystem, Project } from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';

export function getEnergySystem(project: Project, app: SolargisApp): EnergySystemRef | null {
  if (project && (project.status === 'initial' || project.status === 'active')) {
    const system = getProjectDefaultSystem(project, app);
    return {
      projectId: project && project._id,
      app,
      systemId: system && system.systemId
    } as EnergySystemRef;
  } else {
    return null;
  }
}

export function mapDefaultEnergySystem(app: SolargisApp = 'prospect') {
  return (source: Observable<Project>): Observable<EnergySystemRef> => source.pipe(
      map(project => getEnergySystem(project, app)) // take only saved projects
    );
}
