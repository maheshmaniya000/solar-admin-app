import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sg-settings-menu',
  templateUrl: './settings-menu.component.html',
})

export class SettingsMenuComponent {

  @Input() componentName: 'map' | 'list' | 'detail';

  @Output() openSystemSettings = new EventEmitter();
  @Output() openLayerSettings = new EventEmitter();
  @Output() openUnitSettings = new EventEmitter();

}
