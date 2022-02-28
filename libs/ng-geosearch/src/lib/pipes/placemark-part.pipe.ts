import { Pipe, PipeTransform } from '@angular/core';

import { Placemark, getPlacemarkPart } from '@solargis/geosearch';

@Pipe({ name: 'sgPlacemarkPart' })
export class PlacemarkPartPipe implements PipeTransform {

  transform(placemark: Placemark, part: 'name' | 'address' | 'country' = 'address'): string {
    return getPlacemarkPart(placemark, part);
  }
}
