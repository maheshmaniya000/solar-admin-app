import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';

import { sunpath, SunpathOptions } from '@solargis/sg-charts';
import { Project } from '@solargis/types/project';
import { Horizon } from '@solargis/types/site';

import { getSunpathOptions } from '../../../detail/utils/sunpath.chart';

@Component({
  selector: 'sg-sunpath-canvas',
  templateUrl: './sunpath-canvas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SunpathCanvasComponent implements OnChanges {

  @Input() project: Project;
  @Input() horizon: [ number, number ][];

  @ViewChild('sunpath', { static: true }) sunpathCanvas: ElementRef;

  ngOnChanges(): void {
    if (this.project && this.horizon) {
      this.initSunpath();
    }
  }

  initSunpath(): void {
    const canvas = this.sunpathCanvas.nativeElement;

    const options: SunpathOptions<Horizon> = getSunpathOptions(this.project, this.horizon);
    options.font = { // we need different font size as PDF is very small
      ...options.font,
      title: 12,
      axis: 9,
      legend: 10,
      chart: 9
    };
    sunpath(canvas, options);
  }
}
