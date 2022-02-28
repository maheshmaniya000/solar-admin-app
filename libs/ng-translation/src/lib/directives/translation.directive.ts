import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2 } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

import { TranslationDef, TranslationDefResolved, resolveTranslationDef } from '@solargis/types/translation';

@Directive({
  selector: '[sgTranslation]'
})
export class TranslationDirective implements OnInit, OnChanges {

  @Input('sgTranslation') str!: string | TranslationDef;
  @Input('sgTranslationKey') key!: string;

  res!: TranslationDefResolved;

  constructor(private readonly el: ElementRef, private readonly renderer: Renderer2, private readonly transloco: TranslocoService) {}

  ngOnInit(): void {
    this.transloco.langChanges$.subscribe(() => this.updateTranslation());
  }

  ngOnChanges(): void {
    this.res = resolveTranslationDef(this.str, this.key);
    this.updateTranslation();
  }

  private updateTranslation(): void {
    if (this.res) {
      const text$ = this.res.translate
        ? this.transloco.selectTranslate(this.res.translateKey as string, this.res.translateParams)
        : of(this.res.plainText);

      text$.pipe(first()).subscribe(text => {
        this.renderer.setProperty(this.el.nativeElement, 'innerHTML', text);
      });
    }
  }
}
