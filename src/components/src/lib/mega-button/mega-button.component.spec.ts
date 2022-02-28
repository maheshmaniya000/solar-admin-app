import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';

import { MegaButtonIcon } from './mega-button-icon.enum';
import { MegaButtonComponent } from './mega-button.component';

describe('MegaButtonComponent', () => {
  describe('unit', () => {
    let component: MegaButtonComponent;

    beforeEach(() => {
      component = new MegaButtonComponent();
    });

    describe('imageSrc', () => {
      it(`should return correct image src`, () => {
        component.icon = MegaButtonIcon['app-prospect'];
        expect(component.imageSrc).toEqual('assets/img/mega-button/sprite.svg#app-prospect');
      });
    });
  });

  describe('component', () => {
    let spectator: SpectatorHost<MegaButtonComponent>;
    const createHost = createHostFactory(MegaButtonComponent);

    beforeEach(
      () =>
        (spectator = createHost('<sg-mega-button [icon]="icon">Label</sg-mega-button>', {
          hostProps: {
            icon: MegaButtonIcon['app-prospect']
          }
        }))
    );

    it('should render mega button with correct icon', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
