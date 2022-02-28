import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';

import { SectionComponent } from './section.component';

describe('SectionComponent', () => {
  describe('component', () => {
    const createHost = createHostFactory({
      component: SectionComponent
    });
    let spectator: SpectatorHost<SectionComponent>;

    beforeEach(() => {
      spectator = createHost(`
        <sg-section>
          <section>Some transcluded <b>content</b></section>
        </sg-section>`);
    });

    it('should match snapshot with transcluded section without header', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should match snapshot with transcluded section with header', () => {
      spectator.setInput({
        headerText: 'Some header'
      });
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
