import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sg-fullscreen-dialog-toolbar',
  templateUrl: './fullscreen-dialog-toolbar.component.html',
  styleUrls: ['./fullscreen-dialog-toolbar.component.scss']
})
export class FullscreenDialogToolbarComponent {
  @Input() headline;
  @Input() subheadline;
  @Output() onClose = new EventEmitter<undefined>();
}
