import { createHostFactory, Spectator } from '@ngneat/spectator/jest';

import { PageBarComponent } from './page-bar.component';

describe('PageBarComponent', () => {
  describe('component', () => {
    let spectator: Spectator<PageBarComponent>;
    const createHost = createHostFactory({
      component: PageBarComponent
    });

    it('should match snapshot without content', () => {
      spectator = createHost(`<sg-page-bar></sg-page-bar>`);
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should match snapshot with content', () => {
      spectator = createHost(`<sg-page-bar><div>some <b>content</b>'</div></sg-page-bar>`);
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
