import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RangeIndicatorComponent } from './range-indicator.component';
import { RangeIndicatorModule } from './range-indicator.module';

interface RangeIndicatorConfig {
  min: number;
  max: number;
  target: number;
  value: number;
}

describe('RangeIndicatorComponent', () => {
  const setInputs = (
    { min, max, target, value }: RangeIndicatorConfig,
    component: RangeIndicatorComponent
  ): void => {
    component.min = min;
    component.max = max;
    component.target = target;
    component.value = value;
    component.ngOnChanges();
  };

  describe('unit', () => {
    let component: RangeIndicatorComponent;

    const setInputsForUnitTest = (config: RangeIndicatorConfig): void => {
      setInputs(config, component);
    };

    beforeEach(() => {
      component = new RangeIndicatorComponent();
    });

    describe('ngOnChanges', () => {
      it('should throw when `min` is greater than `max`', () => {
        expect(() =>
          setInputsForUnitTest({ min: 150, max: 100, target: 80, value: 50 })
        ).toThrow();
      });

      it('should throw when `min` is equal to `max`', () => {
        expect(() =>
          setInputsForUnitTest({ min: 0, max: 0, target: 0, value: 0 })
        ).toThrow();
      });
    });

    describe('barWidth', () => {
      it('should be correctly recalculated when inputs change', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 80, value: 50 });
        expect(component.barWidth).toBe(50);

        setInputsForUnitTest({ min: -50, max: 50, target: 20, value: 10 });
        expect(component.barWidth).toBe(60);
      });

      it('should be 0 when `value` is less than `min`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 80, value: -1 });
        expect(component.barWidth).toBe(0);
      });

      it('should be 100 when `value` is greater than `max`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 80, value: 101 });
        expect(component.barWidth).toBe(100);
      });
    });

    describe('targetPosition', () => {
      it('should be correctly recalculated when inputs change', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 80, value: 50 });
        expect(component.targetPosition).toBe(80);

        setInputsForUnitTest({ min: -50, max: 50, target: -40, value: 50 });
        expect(component.targetPosition).toBe(10);
      });

      it('should be 0 when `target` is less than `min`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: -1, value: 50 });
        expect(component.targetPosition).toBe(0);
      });

      it('should be 100 when `target` is greater than `min`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 101, value: 50 });
        expect(component.targetPosition).toBe(100);
      });
    });

    describe('barColorClass', () => {
      it('should be `less` when `value` is less than `target`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 51, value: 50 });
        expect(component.barColorClass).toBe('less');
      });

      it('should be `equal` when `value` is equal `target`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 50, value: 50 });
        expect(component.barColorClass).toBe('equal');
      });

      it('should be `greater` when `value` is greater than `target`', () => {
        setInputsForUnitTest({ min: 0, max: 100, target: 49, value: 50 });
        expect(component.barColorClass).toBe('greater');
      });
    });
  });

  describe('component', () => {
    let fixture: ComponentFixture<RangeIndicatorComponent>;
    let component: RangeIndicatorComponent;

    const setInputsForComponentTest = (config: RangeIndicatorConfig): void => {
      setInputs(config, component);
      fixture.detectChanges();
    };

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [RangeIndicatorModule]
        }).compileComponents();

        fixture = TestBed.createComponent(RangeIndicatorComponent);
        component = fixture.componentInstance;
      })
    );

    it('should correctly render when `value` is less than `target`', () => {
      setInputsForComponentTest({ min: 0, max: 100, value: 50, target: 80 });
      expect(fixture).toMatchSnapshot();
    });

    it('should correctly render when `value` is equal to `target`', () => {
      setInputsForComponentTest({ min: 0, max: 100, value: 50, target: 50 });
      expect(fixture).toMatchSnapshot();
    });

    it('should correctly render when `value` is greater than `target`', () => {
      setInputsForComponentTest({ min: 0, max: 100, value: 50, target: 20 });
      expect(fixture).toMatchSnapshot();
    });
  });
});
