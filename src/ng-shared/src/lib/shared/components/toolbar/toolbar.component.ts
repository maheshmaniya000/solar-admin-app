import { Component, Input } from '@angular/core';

@Component({
  selector: 'sg-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() wrapperOnly = false;
}
