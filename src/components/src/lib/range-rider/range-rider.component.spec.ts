import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { RangeRiderMocks } from './mock/range-rider.mocks';
import { RangeRiderStop } from './model/range-rider-stop.model';
import { RangeRiderComponent } from './range-rider.component';

describe('RangeRiderComponent', () => {
  describe('unit', () => {
    let component: RangeRiderComponent;
    beforeEach(() => {
      component = new RangeRiderComponent();
    });

    describe('ngOnChanges', () => {
      ([
        [],
        undefined,
        null,
        [{ value: 5, color: '#FFF' }],
        [
          { value: undefined, color: '#FFF' },
          { value: 5, color: '#FFF' }
        ],
        [
          { value: null, color: '#FFF' },
          { value: 5, color: '#FFF' }
        ],
        [
          { value: 5, color: undefined },
          { value: 5, color: '#FFF' }
        ],
        [
          { value: 5, color: null },
          { value: 5, color: '#FFF' }
        ],
        [
          { value: 5, color: '#FFF' },
          { value: 5, color: '#FFF' }
        ]
      ] as RangeRiderStop[][]).forEach(stops => {
        it(`should throw when input '${JSON.stringify(
          stops
        )}' is not valid array of range rider stops`, () => {
          component.stops = stops;
          expect(() => component.ngOnChanges()).toThrow();
        });
      });

      describe('updated properties', () => {
        beforeEach(() => {
          component.stops = RangeRiderMocks.mockStopsWithIntervalOfOneColor;
        });

        const setupTest = (value: number): void => {
          component.value = value;
          component.ngOnChanges();
        };

        const buildLinearGradientExpression = (
          startColor: string,
          endColor: string
        ): string =>
          `linear-gradient(to right, ${startColor}, 50%, ${endColor})`;

        ([
          {
            testValue: undefined,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 0
          },
          {
            testValue: null,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 0
          },
          {
            testValue: -5,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 0
          },
          {
            testValue: 0,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 0
          },
          {
            testValue: 5,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 0
          },
          {
            testValue: 4.99,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 0
          },
          {
            testValue: 6,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 4
          },
          {
            testValue: 15,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 0,
              background: buildLinearGradientExpression('#E30000', '#F4B300')
            },
            expectedRiderLeftOffset: 40
          },
          {
            testValue: 15.01,
            expectedActiveIntervalConfig: {
              width: 20,
              leftOffset: 40,
              background: buildLinearGradientExpression('#94C34A', '#94C34A')
            },
            expectedRiderLeftOffset: 40.04
          },
          {
            testValue: 20,
            expectedActiveIntervalConfig: {
              width: 20,
              leftOffset: 40,
              background: buildLinearGradientExpression('#94C34A', '#94C34A')
            },
            expectedRiderLeftOffset: 60
          },
          {
            testValue: 25.01,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 60,
              background: buildLinearGradientExpression('#F4B300', '#E30000')
            },
            expectedRiderLeftOffset: 80.04
          },
          {
            testValue: 30,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 60,
              background: buildLinearGradientExpression('#F4B300', '#E30000')
            },
            expectedRiderLeftOffset: 100
          },
          {
            testValue: 30.01,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 60,
              background: buildLinearGradientExpression('#F4B300', '#E30000')
            },
            expectedRiderLeftOffset: 100
          },
          {
            testValue: 35,
            expectedActiveIntervalConfig: {
              width: 40,
              leftOffset: 60,
              background: buildLinearGradientExpression('#F4B300', '#E30000')
            },
            expectedRiderLeftOffset: 100
          }
        ] as {
          testValue: number | undefined | null;
          expectedActiveIntervalConfig: {
            width: number;
            leftOffset: number;
            background: string;
          };
          expectedRiderLeftOffset: number;
        }[]).forEach(
          ({
            testValue,
            expectedActiveIntervalConfig,
            expectedRiderLeftOffset
          }) => {
            const testValueMessage = `; (test value: ${testValue})`;

            it(`should contain correct active interval config${testValueMessage}`, () => {
              setupTest(testValue);
              expect(component.activeIntervalConfig).toEqual(
                expectedActiveIntervalConfig
              );
            });

            it(`should contain correct left offset of rider div element in percentage${testValueMessage}`, () => {
              setupTest(testValue);
              expect(component.riderLeftOffset).toBe(expectedRiderLeftOffset);
            });
          }
        );
      });
    });
  });

  describe('component', () => {
    const createComponent = createComponentFactory({
      component: RangeRiderComponent,
      shallow: true
    });
    let spectator: Spectator<RangeRiderComponent>;

    beforeEach(() => {
      spectator = createComponent({
        props: {
          stops: RangeRiderMocks.mockStopsWithIntervalOfOneColor,
          value: 10
        }
      });
      spectator.component.ngOnChanges();
    });

    it('should render with correctly bound attributes', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});
