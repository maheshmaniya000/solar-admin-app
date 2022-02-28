import { OnDestroy, Pipe, PipeTransform } from '@angular/core';

import { PlacemarkPartPipe } from '@solargis/ng-geosearch';
import { UnitValuePipe } from '@solargis/ng-unit-value';
import { Project } from '@solargis/types/project';
import { latlngUnit } from '@solargis/units';


@Pipe({ name: 'sgProjectName' })
export class ProjectNamePipe implements PipeTransform, OnDestroy {

  constructor(private readonly placemarkPart: PlacemarkPartPipe, private readonly unitValue: UnitValuePipe) {
  }

  ngOnDestroy(): void {
    this.unitValue.ngOnDestroy();
  }

  transform(project: Project, maxNameLength = 50): string {
    const name = this.transformName(project);
    if (maxNameLength && name && name.length > maxNameLength) {return `${name.substr(0, maxNameLength)}…`;}
    return name;
  }

  private transformName(project: Project): string {
    if (!project) {return undefined;}
    if (project.name) {return project.name;}

    if (project.site.place && project.site.place.placemark) {
      const placemarkName = this.placemarkPart.transform(project.site.place.placemark, 'name');
      if (placemarkName) {return placemarkName;}
    }

    return this.unitValue.transform(project.site.point, latlngUnit);
  }
}
