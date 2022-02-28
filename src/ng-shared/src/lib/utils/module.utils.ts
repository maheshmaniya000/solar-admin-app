import { ApplicationRef, Injector } from '@angular/core';
import { disableDebugTools, enableDebugTools } from '@angular/platform-browser';

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md

export function decorateModuleRef<T extends { injector: Injector }>(modRef: T, production = false): T {
  if (production) {
    disableDebugTools();
    return modRef;

  } else {
    const appRef = modRef.injector.get(ApplicationRef);
    const cmpRef = appRef.components[0];
    enableDebugTools(cmpRef);

    const ng = (window as any).ng;
    (window as any).ng.probe = ng.probe;
    (window as any).ng.coreTokens = ng.coreTokens;

    return modRef;
  }
}
