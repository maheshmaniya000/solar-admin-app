import { Component, OnInit, Input } from '@angular/core';

import { MapLayerDef } from '@solargis/types/map';
import { Project } from '@solargis/types/project';

import { Config, ProspectAppConfig } from 'ng-shared/config';

import { satelliteMapLayerId } from '../../../utils/map.constants';

@Component({
  selector: 'sg-project-site',
  templateUrl: './project-site.component.html',
  styleUrls: ['./project-site.component.scss']
})
export class ProjectSiteComponent implements OnInit {
  @Input() project: Project;

  layerDef: MapLayerDef;

  constructor(private readonly config: Config) {}

  ngOnInit(): void {
    const { map } = this.config as ProspectAppConfig;
    if (map && map.layers) {
      this.layerDef = map.layers.find(elem => elem._id === satelliteMapLayerId);
    }
  }
}
