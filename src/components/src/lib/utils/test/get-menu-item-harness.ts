import {
  MatMenuHarness,
  MatMenuItemHarness
} from '@angular/material/menu/testing';

export async function getMenuItemHarness(
  menuItemSelector: string,
  menu: MatMenuHarness
): Promise<MatMenuItemHarness> {
  return (await menu.getItems({ selector: menuItemSelector }))[0];
}
