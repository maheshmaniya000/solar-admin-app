import { Component, TemplateRef, Type } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
  createServiceFactory,
  SpectatorService,
  SpyObject
} from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';

import { runMarbleTest } from '../../utils/test';
import { DialogComponent } from '../dialog.component';
import { DialogConstants } from '../dialog.constants';
import { DialogConfig } from '../model/dialog-config.model';
import { StandardDialogData } from '../standard-dialog/model/standard-dialog-data.model';
import { StandardDialogComponent } from '../standard-dialog/standard-dialog.component';
import { SuccessDialogData } from '../success-dialog/models/success-dialog-data.model';
import { SuccessDialogContentComponent } from '../success-dialog/success-dialog-content.component';
import { DialogService } from './dialog.service';

type AnySemanticDialogData = StandardDialogData<[string | boolean]>;
type AnyDialogPayload = string | boolean;

describe('DialogService', () => {
  let spectator: SpectatorService<DialogService>;
  let dialogTemplateRefStub: Partial<TemplateRef<DialogComponent>>;
  let matDialogSpyObject: SpyObject<MatDialog>;
  const customConfig: DialogConfig = {
    disableClose: true,
    data: {
      customData: 'some value'
    }
  };
  const createService = createServiceFactory({
    service: DialogService,
    mocks: [MatDialog]
  });

  @Component({
    selector: 'sg-test-dialog',
    template: `<div>Some <b>HTML</b> content</div>`
  })
  class TestDialogComponent {}

  beforeEach(() => {
    spectator = createService();
    dialogTemplateRefStub = {
      createEmbeddedView: jest.fn(),
      elementRef: undefined
    };
    matDialogSpyObject = spectator.inject(MatDialog);
  });

  const mockMatDialogSpyOpenMethod = (
    result: AnyDialogPayload = 'dialog closed with this result payload'
  ): void =>
    matDialogSpyObject.open.andReturn({
      afterClosed: () => of(result)
    });

  const expectAfterClosedResult = (
    result$: Observable<AnyDialogPayload>,
    expectedResultPayload: AnyDialogPayload = 'dialog closed with this result payload'
  ): void =>
    runMarbleTest(result$).andExpectToEmit('(a|)', {
      a: expectedResultPayload
    });

  const expectOpenMatDialogMethodCall = (
    dialogContent:
      | TemplateRef<DialogComponent>
      | Type<TestDialogComponent>
      | Type<StandardDialogComponent>,
    config: MatDialogConfig
  ): void =>
    expect(matDialogSpyObject.open).toHaveBeenCalledWith(dialogContent, config);

  [
    {
      dialogName: 'MediumDialog',
      expectedDialogConfig: {}
    },
    {
      dialogName: 'LargeDialog',
      expectedDialogConfig: DialogConstants.defaultConfigs.large
    },
    {
      dialogName: 'FeaturedDialog',
      expectedDialogConfig: DialogConstants.defaultConfigs.featured
    }
  ].forEach(({ dialogName, expectedDialogConfig }) => {
      describe(`open${dialogName}`, () => {
        beforeEach(()=> mockMatDialogSpyOpenMethod());

        it(`should call open for ${dialogName} with its default config and templateRef as content 
and return result observable`, () => {
          const result$ = spectator.service[`open${dialogName}`](
            dialogTemplateRefStub
          ).afterClosed();
          expectOpenMatDialogMethodCall(
            dialogTemplateRefStub as TemplateRef<DialogComponent>,
            expectedDialogConfig
          );
          expectAfterClosedResult(result$);
        });

        it(`should call open for ${dialogName} with its default config and component as content 
and return result observable`, () => {
          const result$ = spectator.service[`open${dialogName}`](
            TestDialogComponent
          ).afterClosed();
          expectOpenMatDialogMethodCall(
            TestDialogComponent,
            expectedDialogConfig
          );
          expectAfterClosedResult(result$);
        });

        it(`should call open for ${dialogName} with a custom config`, () => {
          spectator.service[`open${dialogName}`](undefined, customConfig);
          expectOpenMatDialogMethodCall(
            undefined,
            expect.objectContaining(customConfig)
          );
        });
      });
    }
  );

  describe('open semantic dialogs tests', () => {
    const openDialogAndGetResult = (
      data: AnySemanticDialogData,
      openDialogMethodName: string
    ): [Observable<AnyDialogPayload>, AnyDialogPayload] => {
      const resultPayload = data.actions[0].payload;
      mockMatDialogSpyOpenMethod(resultPayload);
      const result$ = (
        spectator.service[openDialogMethodName] as (
          config: DialogConfig<AnySemanticDialogData>
        ) => MatDialogRef<StandardDialogComponent, AnyDialogPayload>
      )({ data }).afterClosed();

      return [result$, resultPayload];
    };

    [
      {
        openDialogMethodName: 'openStandardDialog',
        payload: 'result text'
      },
      {
        openDialogMethodName: 'openConfirmationDialog',
        payload: true
      }
    ].forEach(({ openDialogMethodName, payload }) => {
      it(`should call open (${openDialogMethodName}) for standard dialog with data 
and return observable with the payload: ${payload}`, () => {
        const data: AnySemanticDialogData = {
          titleTranslationKey: 'some.title',
          content: 'Some content',
          closeIconButtonEnabled: false,
          actions: [
            {
              textTranslationKey: 'some.actionText',
              payload,
              dismissing: false,
              dataTest: 'some-action-button'
            }
          ]
        };
        expectAfterClosedResult(
          ...openDialogAndGetResult(data, openDialogMethodName)
        );
        expectOpenMatDialogMethodCall(StandardDialogComponent, {
          ...DialogConstants.defaultConfigs.medium,
          data
        });
      });

      it(`should call open (${openDialogMethodName}) for standard dialog 
with closeIconButtonEnabled set to 'true' if it was not provided`, () => {
        mockMatDialogSpyOpenMethod();
        const data: StandardDialogData = { content: 'some content' };
        spectator.service[openDialogMethodName]({ data });
        expectOpenMatDialogMethodCall(
          StandardDialogComponent,
          expect.objectContaining({ data: { ...data, closeIconButtonEnabled: true } })
        );
      });

      it(`should call open (${openDialogMethodName}) for standard dialog with a custom config`, () => {
        mockMatDialogSpyOpenMethod();
        spectator.service[openDialogMethodName](customConfig);
        expectOpenMatDialogMethodCall(
          StandardDialogComponent,
          expect.objectContaining({ ...customConfig, data: { ...customConfig.data, closeIconButtonEnabled: true } })
        );
      });
    });
  });

  describe('openSuccessDialog', () => {
    it(`should call open for standard dialog with featured dialog's default config 
and SuccessDialogContentComponent as content and return result observable`, () => {
      const successDialogData: SuccessDialogData = {
        imageUrl: 'some-image.jpg',
        imageAltTextTranslationKey: 'some alt',
        headerTranslationKey: 'some title',
        actions: [
          {
            textTranslationKey: 'some.actionText',
            payload: true,
            dismissing: false,
            dataTest: 'some-action-button'
          }
        ]
      };
      mockMatDialogSpyOpenMethod();
      const result$ = spectator.service.openSuccessDialog(successDialogData).afterClosed();
      expectOpenMatDialogMethodCall(StandardDialogComponent, {
        ...DialogConstants.defaultConfigs.featured,
        data: {
          ...successDialogData,
          content: SuccessDialogContentComponent,
          closeIconButtonEnabled: false
        }
      });
      expectAfterClosedResult(result$);
    });
  });
});
