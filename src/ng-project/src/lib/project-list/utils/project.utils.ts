import { EnergySystemRef, getProjectAccess, getProjectDefaultSystemId, Project } from '@solargis/types/project';
import { SolargisApp, UserRef } from '@solargis/types/user-company';

export function transferAvailable(projects: Project[], user: UserRef, hasAnyCompany: boolean): boolean {
  if (!user) {return false;}
  if (!projects || !projects.length) {return false;}

  let allOwnedProjects = true;
  let allCompanyProjects = true;
  let noCompanyProjects = true;

  projects.forEach(project => {
    const access = getProjectAccess(project, user);
    if (!access || access.role !== 'owner') {allOwnedProjects = false;} // TODO or company admin
    if (!project.company) {allCompanyProjects = false;}
    if (project.company) {noCompanyProjects = false;}
  });

  return allOwnedProjects && (allCompanyProjects || (noCompanyProjects && hasAnyCompany));
}

export function getProjectDefaultEnergySystemRef(project: Project, app: SolargisApp): EnergySystemRef {
  return { projectId: project._id, app, systemId: getProjectDefaultSystemId(project, app) };
}
