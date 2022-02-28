import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sg-success-message',
  templateUrl: './success-message.component.html',
  styleUrls: ['./success-message.component.scss']
})
export class SuccessMessageComponent {
  @Input() heading: string;
  @Input() message: string;
  @Input() buttonText: string;

  @Output() buttonClick: EventEmitter<void> = new EventEmitter();
}
