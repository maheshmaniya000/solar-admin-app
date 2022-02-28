import { Component } from '@angular/core';

@Component({
  template: `<mat-progress-spinner
    mode="indeterminate"
    color="accent"
    diameter="16"
  >
  </mat-progress-spinner>`,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    `
  ]
})
export class BlockUiTemplateComponent {}
