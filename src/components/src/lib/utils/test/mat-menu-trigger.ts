import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Spectator } from '@ngneat/spectator/jest';

import { toDataTestAttributeSelector } from './to-data-test-attribute-selector';

export function expectMatMenuBoundToTrigger(
  spectator: Spectator<any>,
  config: {
    triggerSelector: string;
    menuSelector: string;
  }
): void {
  expect(
    spectator.query(toDataTestAttributeSelector(config.triggerSelector), {
      read: MatMenuTrigger
    }).menu
  ).toEqual(
    spectator.query(toDataTestAttributeSelector(config.menuSelector), {
      read: MatMenu
    })
  );
}
