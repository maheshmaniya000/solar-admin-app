import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import {
  TranslocoModule,
  TranslocoTestingModule
} from '@ngneat/transloco';
import { TranslocoMessageFormatModule } from '@ngneat/transloco-messageformat';
import { registerFont } from 'canvas';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { Observable, of } from 'rxjs';

import { ProspectAppConfig } from 'ng-shared/config';

// FIXME 5733 - move to @solargis/webapps/i18n ?
import en from '../../../../../../ng-shared/src/assets/i18n/en.json';
import { ltaDataset } from '../../../../../../server/models/prospect-config';
import { LTA_DATASET } from '../../../project/services/lta-dataset.factory';
import { MapLegendService } from '../../services/map-legend.service';
import { GrassFileLegend, GrassFileParser } from '../../utils/grass-file.parser';
import { MapLegendCanvasComponent } from './map-legend-canvas.component';

describe('MapLegendCanvasComponent', () => {
  let component: MapLegendCanvasComponent;
  let fixture: ComponentFixture<MapLegendCanvasComponent>;

  const mockMapLegendService = (): Partial<MapLegendService> => ({
    getGrassFileLegend: (legendUrl, dataKey): Observable<GrassFileLegend> => {
      // FIXME 5733
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const legendFile = require(legendUrl);
      return of(new GrassFileParser().parse(legendFile, dataKey));
    }
  });

  const canvasToImageBuffer = (canvas: HTMLCanvasElement): Buffer =>
    Buffer.from(canvas.toDataURL().replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const expectToMatchImageSnapshot = (): void => {
    expect(canvasToImageBuffer(component.legendEl.nativeElement))
      .toMatchImageSnapshot({ failureThreshold: 0.1, failureThresholdType: 'percent' });
  };

  const setupTest = (dataKey: string, layerPath: string): void => {
    component.responsive = false;
    component.dataKey = dataKey;
    component.legendUrl = `./grass/${layerPath}.grass`;
    component.lang = 'en';
    component.unitToggle = {
      currency: 'USD',
      installedPower: 'kWp',
      irradiation: 'kWh/m2',
      kWhCurrency: 'MWh',
      kwpCost: 'Wp',
      latlng: 'DMS',
      length: 'm',
      ltaDaily: 'perDay',
      pvoutTotal: 'Wh',
      pvoutTotalWh: 'Wh',
      temperature: '°C'
    };
    component.ngOnChanges();
  };

  beforeAll(() => {
    expect.extend({
      toMatchImageSnapshot: configureToMatchImageSnapshot({
        customSnapshotIdentifier: ({ currentTestName }) => {
          const currentTestNameParts = currentTestName.split(' ');
          return currentTestNameParts.slice(1, currentTestNameParts.length).join('-');
        }
      })
    });
  });

  beforeEach(
    waitForAsync(() => {
      registerFont('src/ng-project/src/lib/map/controls/map-legend-canvas/roboto-regular.spec.ttf', {
        family: 'Roboto'
      });
      TestBed.configureTestingModule({
        declarations: [MapLegendCanvasComponent],
        imports: [
          TranslocoMessageFormatModule.init(),
          TranslocoModule,
          HttpClientTestingModule,
          TranslocoTestingModule.forRoot({
            langs: { en },
            translocoConfig: {
              availableLangs: ['en'],
              defaultLang: 'en',
            },
            preloadLangs: true
          })
        ],
        providers: [
          { provide: MapLegendService, useValue: mockMapLegendService() },
          ProspectAppConfig,
          { provide: LTA_DATASET, useValue: ltaDataset }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(MapLegendCanvasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('ELE', fakeAsync(() => {
    setupTest('ELE', 'terrain_elevation_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('PVOUT_csi', fakeAsync(() => {
    setupTest('PVOUT_csi', 'pvout_csi_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('GHI', fakeAsync(() => {
    setupTest('GHI', 'ghi_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('DNI', fakeAsync(() => {
    setupTest('DNI', 'dni_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('D2G',fakeAsync(() => {
    setupTest('D2G', 'd2g_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('GTI_opta', fakeAsync(() => {
    setupTest('GTI_opta', 'gti_opta_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('OPTA', fakeAsync(() => {
    setupTest('OPTA', 'opta_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('GHI_season', fakeAsync(() => {
    setupTest('GHI_season', 'ghi_season_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('DNI_season', fakeAsync(() => {
    setupTest('DNI_season', 'dni_season_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('ALB', fakeAsync(() => {
    setupTest('ALB', 'albedo_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('TEMP', fakeAsync(() => {
    setupTest('TEMP', 'temp_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('WS', fakeAsync(() => {
    setupTest('WS', 'ws_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('RH', fakeAsync(() => {
    setupTest('RH', 'rh_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('PWAT', fakeAsync(() => {
    setupTest('PWAT', 'pwat_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('PREC', fakeAsync(() => {
    setupTest('PREC', 'precip_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('SNOWD', fakeAsync(() => {
    setupTest('SNOWD', 'sdwe_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('CDD', fakeAsync(() => {
    setupTest('CDD', 'deg_day_cool_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('HDD', fakeAsync(() => {
    setupTest('HDD', 'deg_day_heat_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('POPUL', fakeAsync(() => {
    setupTest('POPUL', 'population_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('SLO', fakeAsync(() => {
    setupTest('SLO', 'terrain_slope_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('AZI', fakeAsync(() => {
    setupTest('AZI', 'terrain_aspect_global');
    tick();
    expectToMatchImageSnapshot();
  }));

  it('LANDC', fakeAsync(() => {
    setupTest('LANDC', 'landcover_global');
    tick();
    expectToMatchImageSnapshot();
  }));
});
