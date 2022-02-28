import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sg-page-bar',
  templateUrl: './page-bar.component.html',
  styleUrls: ['./page-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBarComponent {}
