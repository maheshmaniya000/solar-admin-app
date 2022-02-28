import { ModuleWithProviders } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

export class TranslocoMocks {
  static createTestingModule(): ModuleWithProviders<TranslocoTestingModule> {
    return TranslocoTestingModule.forRoot({langs: {}});
  }
}
