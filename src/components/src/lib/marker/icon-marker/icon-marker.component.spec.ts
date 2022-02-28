import { ElementRef } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { mockElementDimensions } from '../../utils/test';
import { MarkerModule } from '../marker.module';
import { IconMarkerComponent } from './icon-marker.component';

import spyOn = jest.spyOn;

describe('IconMarkerComponent', () => {
  describe('unit', () => {
    let component: IconMarkerComponent;

    beforeEach(() => {
      const element = document.createElement('div');
      mockElementDimensions(element, 20, 40);
      component = new IconMarkerComponent(new ElementRef(element));
    });

    describe('getPivotPoint', () => {
      it(`should return the icon marker's pivot point`, () => {
        component.icon = 'some-icon';
        expect(component.getPivotPoint()).toEqual({ u: 10, v: 30 });
      });
    });
  });

  describe('component', () => {
    let spectator: Spectator<IconMarkerComponent>;
    const createComponent = createComponentFactory({
      component: IconMarkerComponent,
      imports: [MarkerModule]
    });

    beforeEach(() => (spectator = createComponent()));

    it('should render empty marker with smaller svg', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });

    it('should render marker with bigger svg and with icon', () => {
      spectator.setInput('icon', 'latlon_16px');
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
