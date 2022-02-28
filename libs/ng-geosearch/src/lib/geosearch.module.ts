import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider, InjectionToken } from '@angular/core';

import { PlacemarkPartPipe } from './pipes';
import { PlacemarkPipe } from './pipes';
import { GeocoderConfig, GeocoderService } from './services/geocoder.service';

export type GeocoderConfigProvider = { provide: InjectionToken<GeocoderConfig> } & Provider;

const PIPES = [ PlacemarkPartPipe, PlacemarkPipe ];

@NgModule({
	imports: [CommonModule],
	declarations: [...PIPES],
	exports: [...PIPES]
})
export class GeosearchModule {

  static forRoot(geocoderConfigProvider: GeocoderConfigProvider): ModuleWithProviders<GeosearchModule> {
    return {
      ngModule: GeosearchModule,
      providers: [
        PlacemarkPartPipe, PlacemarkPipe, // ...PIPES
        GeocoderService,
        geocoderConfigProvider,
        // { provide: GeocoderConfigToken, useValue: config },
        // { provide: 'Window', useValue: window }
      ]
    };
  }

}
