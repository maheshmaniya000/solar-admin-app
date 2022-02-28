import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'sg-accept-cookies',
  templateUrl: './accept-cookies.component.html',
  styleUrls: ['./accept-cookies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptCookiesComponent {
  @Output() acceptCookies: EventEmitter<void> = new EventEmitter();
}
