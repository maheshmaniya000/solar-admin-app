import { HarnessLoader } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { MatDialogHarness } from '@angular/material/dialog/testing';

export async function expectToMatchMatDialogSnapshot(
  rootLoader: HarnessLoader
): Promise<void> {
  const dialog = await rootLoader.getHarness(MatDialogHarness);
  const dialogContainer = (await dialog.host()) as UnitTestElement;
  expect(dialogContainer.element).toMatchSnapshot();
}
