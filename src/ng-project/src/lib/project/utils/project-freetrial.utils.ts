import {
  getProjectAppSubscriptionType,
  getUpdateProjectAppSubscriptionType,
  Project,
  UpdateProjectOpts
} from '@solargis/types/project';
import { AppSubscriptionType } from '@solargis/types/user-company';

export function isProjectEligibleToClaimFreetrial(project: Project): boolean {
  const isSavedProject = project && !!project.created;
  const prospectSubscriptionType = getProjectAppSubscriptionType(project, 'prospect');
  return isSavedProject && !prospectSubscriptionType;
}

export function isFreetrialProject(project: Project): boolean {
  return getProjectAppSubscriptionType(project, 'prospect') === AppSubscriptionType.ProspectFreeTrial;
}

export function isFreetrialClaimUpdate(update: UpdateProjectOpts): boolean {
  return getUpdateProjectAppSubscriptionType(update, 'prospect') === AppSubscriptionType.ProspectFreeTrial;
}
