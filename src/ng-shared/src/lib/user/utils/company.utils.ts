import { AppSubscription, Company, mapProspectLicense } from '@solargis/types/user-company';

export function isCompanyAdmin(company: Company, user: { sgAccountId: string }): boolean {
  return company && user && company.users
    .map(u => u.sgAccountId === user.sgAccountId && u.role === 'ADMIN')
    .some(Boolean);
}

export function getAppSubscription<T extends AppSubscription>(company: Company, app: 'prospect' | 'sdat'): T {
  return app === 'prospect' ? mapProspectLicense(company?.prospectLicense) as T : company?.app?.[app]?.subscription as any as T;
}

export function hasAppSubscriptionSlot(company: Company, app: 'prospect' | 'sdat'): boolean {
  const subscription = getAppSubscription(company, app);
  return !!subscription && (!subscription.assignedUsers || subscription.assignedUsers.length < subscription.usersLimit);
}

export function hasUserAppSubscription(company: Company, user: { sgAccountId: string }, app: 'prospect' | 'sdat'): boolean {
  const subscription = getAppSubscription(company, app);
  return subscription?.assignedUsers.filter(u => u === user.sgAccountId).some(Boolean) || false;
}
