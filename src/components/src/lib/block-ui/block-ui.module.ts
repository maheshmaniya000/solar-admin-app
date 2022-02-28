import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlockUIModule } from 'ng-block-ui';

import { BlockUiTemplateComponent } from './block-ui-template.component';

@NgModule({
  declarations: [BlockUiTemplateComponent],
  imports: [MatProgressSpinnerModule]
})
export class SgBlockUiModule {
  static forRoot(): ModuleWithProviders<BlockUIModule> {
    return BlockUIModule.forRoot({
      template: BlockUiTemplateComponent
    });
  }
}
