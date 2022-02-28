import {
  ChangeDetectionStrategy,
  Component,
  Host,
  OnInit,
  SkipSelf
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { isNil } from 'lodash-es';

@Component({
  selector: 'sg-password-visibility-toggle',
  templateUrl: './password-visibility-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordVisibilityToggleComponent implements OnInit {
  icon: 'visibility' | 'visibility_off';

  private input: HTMLInputElement;

  constructor(
    @Host() @SkipSelf() private readonly matFormField: MatFormField
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line no-underscore-dangle
    const matFormFieldElement: HTMLElement = this.matFormField._elementRef.nativeElement;
    this.input = matFormFieldElement.querySelector('input');

    if (isNil(this.input)) {
      throw new Error('Password visibility toggle must be used with input');
    }

    this.updateIcon();
  }

  onToggle(): void {
    this.input.type = this.isInputTypePassword() ? 'text' : 'password';
    this.updateIcon();
  }

  private updateIcon(): void {
    this.icon = this.isInputTypePassword() ? 'visibility_off' : 'visibility';
  }

  private isInputTypePassword(): boolean {
    return this.input.type === 'password';
  }
}
