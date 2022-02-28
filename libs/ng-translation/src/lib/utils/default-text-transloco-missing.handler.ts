import { HashMap, TranslocoConfig, TranslocoMissingHandler, TranslocoMissingHandlerData } from '@ngneat/transloco';

export class DefaultTextTranslocoMissingHandler implements TranslocoMissingHandler {

  // copy-paste from Transloco DefaultHandler (not exported in public-api)
  private defaultHandle(key: string, config: TranslocoConfig): any {
    if (config.missingHandler?.logMissingKey && !config.prodMode) {
      const msg = `Missing translation for '${key}'`;
      console.warn(`%c ${msg}`, 'font-size: 12px; color: red');
    }
    return key;
  }

  handle(key: string, data: TranslocoMissingHandlerData, params?: HashMap): string {
    return params?.defaultText || this.defaultHandle(key, data);
  }
}
