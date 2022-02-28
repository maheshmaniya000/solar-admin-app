/* eslint-disable max-classes-per-file */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';

import { expectToMatchMatDialogSnapshot } from '../../utils/test';
import { DialogComponent } from '../dialog.component';
import { DialogConstants } from '../dialog.constants';
import { DialogService } from '../service/dialog.service';
import { StandardDialogComponent } from './standard-dialog.component';

describe('StandardDialogComponent', () => {
  describe('component', () => {
    describe('when content is a string', () => {
      let spectator: Spectator<StandardDialogComponent>;
      const createComponent = createComponentFactory({
        component: StandardDialogComponent,
        declarations: [MockComponent(DialogComponent)],
        imports: [MatDialogModule],
        shallow: true
      });

      it('should pass injected mat dialog data to the dialog as props and match snapshot', () => {
        spectator = createComponent({
          providers: [
            {
              provide: MAT_DIALOG_DATA,
              useValue: {
                titleTranslationKey: 'some.title',
                closeIconButtonEnabled: true,
                content: 'Some content',
                actions: [DialogConstants.actions.ok]
              }
            }
          ]
        });
        const sgDialog = spectator.query(DialogComponent);
        expect(sgDialog).toEqual(
          expect.objectContaining({
            closeIconButtonEnabled: true,
            actions: spectator.component.data.actions,
            titleTranslationKey: 'some.title'
          })
        );
        expect(spectator.fixture).toMatchSnapshot();
      });
    });

    describe('when content is a template', () => {
      @Component({
        selector: 'sg-test-container',
        template: `
          <ng-template #content>
            <div>Some <b>HTML</b> content</div>
          </ng-template>
        `
      })
      class TestContainerComponent implements OnInit {
        @ViewChild('content', { static: true })
        content: TemplateRef<HTMLDivElement>;

        constructor(private readonly dialogService: DialogService) {}

        ngOnInit(): void {
          this.dialogService.openStandardDialog({
            data: {
              titleTranslationKey: 'some.title',
              content: this.content,
              dividedContent: true,
              actions: [DialogConstants.actions.ok]
            }
          });
        }
      }

      const createComponent = createComponentFactory({
        component: TestContainerComponent,
        declarations: [StandardDialogComponent],
        imports: [MatDialogModule],
        shallow: true,
        providers: [DialogService]
      });
      let spectator: Spectator<TestContainerComponent>;

      it('should match snapshot', () => {
        spectator = createComponent();
        const rootLoader = TestbedHarnessEnvironment.documentRootLoader(
          spectator.fixture
        );
        expectToMatchMatDialogSnapshot(rootLoader);
      });
    });

    describe('when content is a component', () => {
      @Component({
        selector: 'sg-test-content',
        template: `<div>Some <b>HTML</b> content</div>`
      })
      class TestContentComponent {}

      @Component({
        selector: 'sg-test-container',
        template: ''
      })
      class TestContainerComponent implements OnInit {
        constructor(private readonly dialogService: DialogService) {}

        ngOnInit(): void {
          this.dialogService.openStandardDialog({
            data: {
              titleTranslationKey: 'some.title',
              content: TestContentComponent,
              actions: [DialogConstants.actions.ok]
            }
          });
        }
      }

      const createComponent = createComponentFactory({
        component: TestContainerComponent,
        declarations: [StandardDialogComponent],
        imports: [MatDialogModule],
        shallow: true,
        providers: [DialogService]
      });
      let spectator: Spectator<TestContainerComponent>;

      it('should match snapshot', () => {
        spectator = createComponent();
        const rootLoader = TestbedHarnessEnvironment.documentRootLoader(
          spectator.fixture
        );
        expectToMatchMatDialogSnapshot(rootLoader);
      });
    });
  });
});
