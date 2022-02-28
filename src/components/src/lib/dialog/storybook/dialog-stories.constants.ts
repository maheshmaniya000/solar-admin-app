import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Provider } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {TranslocoRootModule} from  'ng-shared/core/transloco-root.module';

import { SgDefaultsModule } from '../../defaults/defaults.module';
import { DialogModule } from '../dialog.module';

export class DialogStoriesConstants {
  static readonly storyTitle = 'Solargis/Components/Dialog';
  static readonly sampleText = `Si meliora dies, ut vina, poemata reddit, scire velim, chartis pretium
        quotus arroget annus. scriptor abhinc annos centum qui decidit, inter
        perfectos veteresque referri debet an inter vilis atque novos? Si
        meliora dies, ut vina, poemata reddit, scire velim, chartis pretium
        quotus arroget annus. scriptor abhinc annos centum qui decidit, inter
        perfectos veteresque referri debet an inter vilis atque novos?`;
  static readonly dialogModuleDependencies = [
    DialogModule,
    MatButtonModule,
    BrowserAnimationsModule,
    SgDefaultsModule,
    FormsModule,
    HttpClientModule,
    TranslocoRootModule
  ];
  static readonly dialogProviders: Provider[] = [{ provide: APP_BASE_HREF, useValue: '.' }];
}
