import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sg-project-data-key',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ keyTitle }}<small *ngIf="keySubtitle"> {{ keySubtitle }}</small>'
})
export class ProjectDataKeyComponent implements OnInit {

  @Input() key: string;

  keyTitle: string;
  keySubtitle: string;

  ngOnInit(): void {
    if (this.key.indexOf('_') > 0) {
      [this.keyTitle, this.keySubtitle] = this.key.split('_');
    } else {
      this.keyTitle = this.key;
    }
  }

}
