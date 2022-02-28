import { Component } from '@angular/core';

@Component({
  selector: 'sg-form-error',
  template: ` <mat-error [class]="className">
    {{ errorMessage }}
  </mat-error>`,
  styles: [
    `
      :host {
        display: contents;
      }
    `
  ]
})
export class FormErrorComponent {
  errorMessage: string;
  className: string;
}
