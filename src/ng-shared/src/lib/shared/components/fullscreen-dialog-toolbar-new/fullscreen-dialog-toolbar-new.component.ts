import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sg-fullscreen-dialog-toolbar-new',
  templateUrl: './fullscreen-dialog-toolbar-new.component.html',
  styleUrls: ['./fullscreen-dialog-toolbar-new.component.scss']
})
export class FullscreenDialogToolbarNewComponent {

  @Input() headline;
  @Input() subheadline;
  @Output() onClose = new EventEmitter<void>();

}
