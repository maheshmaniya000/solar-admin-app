import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { QuantityComponent } from './quantity.component';

describe('QuantityComponent', () => {
  const createComponentInputs = (): Partial<QuantityComponent> => ({
    title: { text: 'some title', lineCount: 1 },
    subTitle: { text: 'some sub title', lineCount: 2 },
    value: 129.37,
    unitHtml: 'km'
  });

  describe('unit', () => {
    let component: QuantityComponent;

    beforeEach(() => {
      component = new QuantityComponent();
    });

    describe('calculateTitleHeight', () => {
      [undefined, null, -5, 1.3].forEach(value =>
        it(`should throw error when ${value} is provided`, () =>
          expect(() => component.calculateTitleHeight(value)).toThrow())
      );

      it('should return the title height based on the provided number of lines it requires', () => {
        expect(component.calculateTitleHeight(0)).toEqual(0);
        expect(component.calculateTitleHeight(2)).toEqual(36);
      });
    });
  });

  describe('component', () => {
    let spectator: Spectator<QuantityComponent>;

    const createComponent = createComponentFactory({
      component: QuantityComponent
    });

    beforeEach(() => {
      spectator = createComponent({ props: createComponentInputs() });
    });

    it('should render with correctly bound attributes and styles', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should render simple html elements that are part of the unit property', () => {
      spectator.setInput({ unitHtml: 'Wh/m<sup>2</sup>' });
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
