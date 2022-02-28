# @solargis/ng-geosearch

Angular services and pipes supporting `@solargis/geosearch` module.

## GeocoderService 
 
- `parse(query: string)` parsing string into `LatLng`
- `search(query: LatLng | string)` geocoding string address to array of Sites or reverse geocoding `LatLng` to array of Sites

## PlacemarkPipe

- display `Placemark` returned from geocoder as formalized address string 
- usage: `<span>{{ site.place?.placemark | sgPlacemark }}</span>`

## PlacemarkPartPipe

- display specified part of `Placemark` returned from geocoder
- supported parts: `'name' | 'address' | 'country'`
- usage: `<span>{{ site.place?.placemark | sgPlacemarkPart:"country" }}</span>`
