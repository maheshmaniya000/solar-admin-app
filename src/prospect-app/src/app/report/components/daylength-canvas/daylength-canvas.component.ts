import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';

import { daylength, DayLengthOptions } from '@solargis/sg-charts';
import { Project } from '@solargis/types/project';

import { getDaylengthOptions } from '../../../detail/utils/daylength.chart';

@Component({
  selector: 'sg-daylength-canvas',
  templateUrl: './daylength-canvas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaylengthCanvasComponent implements OnChanges {

  @Input() project: Project;
  @Input() horizon: [ number, number ][];

  @ViewChild('daylength', { static: true }) daylengthCanvas: ElementRef;

  ngOnChanges(): void {
    if (this.project && this.horizon) {
      this.initDaylength();
    }
  }

  initDaylength(): void {
    const canvas = this.daylengthCanvas.nativeElement;

    const options: DayLengthOptions = getDaylengthOptions(this.project, this.horizon);
    options.font.size = { // we need different font size as PDF is very small
      title: 12,
      axis: 10,
      tick: 9,
      legend: 10,
      mark: 11
    };
    daylength(canvas, options);
  }
}
