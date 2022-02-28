export type AppMenuApp = {
  name: string;
  link: string;
  app: string;
};

export const appMenuApps: AppMenuApp[] = [
  { name: 'dashboard', link: '/dashboard/', app: 'dashboard' },
  { name: 'prospect', link: '/prospect/', app: 'prospect' },
  // { name: 'evaluate', link: '/evaluate' }
  { name: 'company-admin', link: '/dashboard/company-admin/', app: 'dashboard' },
  { name: 'admin', link: '/admin/', app: 'admin' },
];

export function getAppByUrl(url: string): AppMenuApp {
  if (url.includes('/dashboard/company-admin/')) {
    return appMenuApps.find(a =>
      a.link === '/dashboard/company-admin/');
  } else {
    return appMenuApps.find(a =>
      url.startsWith(a.link));
  }
}
