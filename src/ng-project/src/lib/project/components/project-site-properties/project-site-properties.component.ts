import { Component, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';

import { DataLayer, Dataset, isLayerCodelistValue } from '@solargis/dataset-core';
import { PlacemarkPartPipe } from '@solargis/ng-geosearch';
import { VersionedData } from '@solargis/types/dataset';
import { Project, getProjectAnnualData } from '@solargis/types/project';
import { latlngUnit } from '@solargis/units';

import { LTA_DATASET } from '../../services/lta-dataset.factory';

@Component({
  selector: 'sg-project-site-properties',
  templateUrl: './project-site-properties.component.html',
  styleUrls: ['./project-site-properties.component.scss']
})
export class ProjectSitePropertiesComponent implements OnChanges {

  @Input() project: Project;
  @Input() showBorders = true;

  latlngUnit = latlngUnit;
  landLayerKeys = ['LANDC', 'POPUL', 'AZI', 'SLO'];

  address: string;
  ltaAnnual: VersionedData;

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
          ].filter(x => !!x).join(', ');
        } else {
          this.address = null;
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
