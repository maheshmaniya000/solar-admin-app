import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';

import { HighlightedBoxComponent } from './highlighted-box.component';

describe('HighlightedBoxComponent', () => {
  describe('component', () => {
    const createHost = createHostFactory({
      component: HighlightedBoxComponent,
      shallow: true
    });
    let spectator: SpectatorHost<HighlightedBoxComponent>;

    beforeEach(() => {
      spectator = createHost(`
        <sg-highlighted-box>
          <button>Action</button>
        </sg-highlighted-box>
      `);
    });

    it('should match snapshot with transcluded content and without title ', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should match snapshot with title and transcluded content', () => {
      spectator.setInput('title', 'some title');
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
