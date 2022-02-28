import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { FormErrorComponent } from './form-error.component';

describe('FormErrorComponent', () => {
  describe('component', () => {
    const createComponent = createComponentFactory({
      component: FormErrorComponent,
      shallow: true
    });
    let spectator: Spectator<FormErrorComponent>;

    beforeEach(() => {
      spectator = createComponent({
        props: {
          errorMessage: 'some error',
          className: 'some-class'
        }
      });
    });

    it('should match snapshot with bound attributes', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
