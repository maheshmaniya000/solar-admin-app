import { NgModule, Renderer2, RendererFactory2 } from '@angular/core';
import {
  ErrorStateMatcher,
  MAT_RIPPLE_GLOBAL_OPTIONS
} from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { SgBlockUiModule } from '../block-ui/block-ui.module';
import { ParentErrorStateMatcher } from './error-state-matchers/parent.error-state-matcher';

@NgModule({
  imports: [SgBlockUiModule.forRoot()],
  providers: [
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } },
    { provide: ErrorStateMatcher, useValue: new ParentErrorStateMatcher() },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      }
    }
  ]
})
export class SgDefaultsModule {
  private readonly renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.addMatClassesToBody();
  }

  private addMatClassesToBody(): void {
    this.renderer.addClass(document.body, 'mat-typography');
    this.renderer.addClass(document.body, 'mat-app-background');
  }
}
