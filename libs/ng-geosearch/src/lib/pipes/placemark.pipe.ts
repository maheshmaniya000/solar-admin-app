import { Pipe, PipeTransform } from '@angular/core';

import { Placemark, getPlacemarkAddress } from '@solargis/geosearch';

@Pipe({ name: 'sgPlacemark' })
export class PlacemarkPipe implements PipeTransform {

  transform(placemark: Placemark): string {
    return getPlacemarkAddress(placemark);
  }
}
