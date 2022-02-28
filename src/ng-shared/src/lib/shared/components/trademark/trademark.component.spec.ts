import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';

import { Config } from 'ng-shared/config';

import { TrademarkComponent } from './trademark.component';

describe('TrademarkComponent', () => {
  describe('component', () => {
    const createComponent = createComponentFactory({
      component: TrademarkComponent,
      providers: [
        mockProvider(Config, {
          version: '1.2.3'
        })
      ],
      shallow: true
    });
    let spectator: Spectator<TrademarkComponent>;

    beforeEach(() => {
      jest
        .useFakeTimers('modern')
        .setSystemTime(new Date(2020, 6));
      spectator = createComponent();
      jest.useRealTimers();
    });

    it(`should correctly render component for year 2020 and version 1.2.3`, () => {
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
