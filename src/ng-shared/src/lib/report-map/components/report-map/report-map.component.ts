import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';

import { LatLng } from '@solargis/types/site';

import { REPORT_ASSETS_URL } from 'ng-shared/report-map/services/report-assets-url.factory';
import { ReportMapType } from 'ng-shared/report-map/types';

import { ReportMapService } from '../../services/report-map.service';
import { generateCoverMap, generateSiteMap } from '../../utils/report-map.utils';

@Component({
  selector: 'sg-report-map',
  templateUrl: './report-map.component.html',
  styles: ['canvas { width: 100% }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportMapComponent implements OnInit {
  @Input() type: ReportMapType;
  @Input() point: LatLng;
  @Input() countryCode: string;

  @ViewChild('map', { static: true }) mapEl: ElementRef;

  constructor(private readonly reportMapService: ReportMapService, @Inject(REPORT_ASSETS_URL) private readonly reportAssetsUrl: string) {}

  ngOnInit(): void {
    if (this.type === 'site') {
      this.reportMapService.getAreaBBoxes().subscribe(bboxes => {
        generateSiteMap(this.reportAssetsUrl, bboxes, this.mapEl.nativeElement, this.point, this.countryCode);
      });
    } else {
      generateCoverMap(this.reportAssetsUrl, this.mapEl.nativeElement, this.point);
    }
  }
}
