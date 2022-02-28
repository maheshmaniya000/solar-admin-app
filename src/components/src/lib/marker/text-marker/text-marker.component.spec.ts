import { ElementRef } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { mockElementDimensions } from '../../utils/test';
import { MarkerModule } from '../marker.module';
import { TextMarkerComponent } from './text-marker.component';

import spyOn = jest.spyOn;

describe('TextMarkerComponent', () => {
  describe('unit', () => {
    let component: TextMarkerComponent;

    beforeEach(() => {
      const element = document.createElement('div');
      mockElementDimensions(element, 200, 40);
      component = new TextMarkerComponent(new ElementRef(element));
    });

    describe('getPivotPoint', () => {
      it(`should return the text marker's pivot point when showing caret`, () => {
        expect(component.getPivotPoint()).toEqual({ u: 100, v: 50 });
      });

      it(`should return center of element when not showing caret`, () => {
        component.caretHidden = true;
        expect(component.getPivotPoint()).toEqual({ u: 100, v: 20 });
      });
    });
  });

  describe('component', () => {
    let spectator: Spectator<TextMarkerComponent>;
    const createComponent = createComponentFactory({
      component: TextMarkerComponent,
      imports: [MarkerModule],
      declareComponent: false
    });

    beforeEach(() => (spectator = createComponent()));

    it('should render component with text & caret', () => {
      spectator.setInput('text', 'some text');
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should render component with text & without caret', () => {
      spectator.setInput('text', 'some text');
      spectator.setInput('caretHidden', true);
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should emit selectedChange event when clicked', () => {
      const emitSpy = spyOn(spectator.component.selectedChange, 'emit');
      spectator.click(spectator.element);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      spectator.setInput('selected', true);
      spectator.click(spectator.element);
      expect(emitSpy).toHaveBeenCalledTimes(2);
    });

    it('should toggle selected class when selected property changes', () => {
      expect(spectator.element).not.toHaveClass('selected');
      spectator.setInput('selected', true);
      spectator.detectChanges();
      expect(spectator.element).toHaveClass('selected');
      spectator.setInput('selected', false);
      spectator.detectChanges();
      expect(spectator.element).not.toHaveClass('selected');
    });
  });
});
