import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CaptchaModule } from '../captcha/captcha.module';
import { SharedModule } from '../shared/shared.module';
import { FupDialogComponent } from './components/fup-dialog/fup-dialog.component';
import { FUPHttpClientService } from './services/fup-http-client.service';
import { FupService } from './services/fup.service';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CaptchaModule
  ],
  declarations: [
    FupDialogComponent
  ],
  exports: [
  ],
  providers: [
    FupService,
    FUPHttpClientService,
  ],
  entryComponents: [
    FupDialogComponent
  ]
})
export class FupModule {

  static forRoot(): ModuleWithProviders<FupModule> {
    return {
      ngModule: FupModule,
      providers: [FupService, FUPHttpClientService]
    };
  }

}
