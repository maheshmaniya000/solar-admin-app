
export function windowFactory(): any { return window; }

export function appBaseHrefFactory(app: string): string {
  return `/${app}/`;
}
