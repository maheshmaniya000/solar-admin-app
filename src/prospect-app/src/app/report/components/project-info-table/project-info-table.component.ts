import { Component, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';

import { DataLayer, Dataset, isLayerCodelistValue } from '@solargis/dataset-core';
import { PlacemarkPartPipe } from '@solargis/ng-geosearch';
import { VersionedData } from '@solargis/types/dataset';
import { Project, getProjectAnnualData } from '@solargis/types/project';
import { latlngToUrlParam } from '@solargis/types/site';
import { latlngToggle } from '@solargis/units';

import { LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';

@Component({
  selector: 'sg-project-info-table',
  templateUrl: './project-info-table.component.html',
  styleUrls: ['./project-info-table.component.scss']
})
export class ProjectInfoTableComponent implements OnChanges {

  @Input() project: Project;

  latlngToggle = latlngToggle;
  landLayerKeys = ['LANDC', 'POPUL', 'AZI', 'SLO'];

  address: string;
  ltaAnnual: VersionedData;
  url: string;

  constructor(
    @Inject(LTA_DATASET) public ltaDataset: Dataset,
    public placemarkPart: PlacemarkPartPipe
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.project) {
      this.ltaAnnual = undefined;
      if (this.project) {
        this.ltaAnnual = getProjectAnnualData(this.project, 'prospect', 'lta');
        if (this.project.site.place) {
          this.address = [
            this.placemarkPart.transform(this.project.site.place.placemark, 'address'),
            this.placemarkPart.transform(this.project.site.place.placemark, 'country')
          ].filter(Boolean).join(', ');
        } else {
          this.address = null;
        }
        if (this.project.site) {
          const point = this.project.site.point;
          if (point) {
            const s = latlngToUrlParam(point);
            this.url = `${window.location.origin}/prospect/map?c=${s},10&s=${s}`;
          }
        }
      }
    }
  }

  layer(key: string): DataLayer {
    return this.ltaDataset.annual.get(key);
  }

  isCodelistValue(key: string): boolean {
    const layer = this.layer(key);
    const value = this.ltaAnnual && this.ltaAnnual.data[key];
    return isLayerCodelistValue(layer, value);
  }

}
