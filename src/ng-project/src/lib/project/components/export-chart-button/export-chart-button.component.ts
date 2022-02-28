import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sg-export-chart-button',
  template: `
    <button mat-menu-item (click)="exportChart.emit()">
      {{ 'project.exportChart.exportTo' | transloco:{ format: format } }}
    </button>
  `
})
export class ExportChartButtonComponent {
  @Input() format: string = 'PNG';
  @Output() exportChart: EventEmitter<void> = new EventEmitter();
}
