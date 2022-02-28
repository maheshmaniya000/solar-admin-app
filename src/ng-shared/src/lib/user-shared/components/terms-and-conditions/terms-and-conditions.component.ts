import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'sg-terms-and-conditions',
  template: `
  <iframe
    [src]="url()"
    style="width: 100%; height: 180px; border: 1px solid #D0D5DB; box-sizing: border-box;"
  ></iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsAndConditionsComponent {
  @Input() variant: 'terms' | 'privacy' | 'contractual-terms' | 'particular-conditions' = 'terms';

  constructor(private readonly sanitizer: DomSanitizer) { }

  url(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `assets/terms-and-conditions/${this.variant}.html`
    );
  }
}
