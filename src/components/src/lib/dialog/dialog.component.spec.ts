import { ElementRef } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {
  createHostFactory,
  SpectatorHost
} from '@ngneat/spectator/jest';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { MockDirective } from 'ng-mocks';
import {
  Observable,
  of
} from 'rxjs';

import { toDataTestAttributeSelector } from '../utils/test/to-data-test-attribute-selector';
import { DialogComponent } from './dialog.component';
import { DialogFooterDirective } from './footer-content/dialog-footer.directive';
import { DialogAction } from './model/dialog-action.model';

describe('DialogComponent', () => {
  describe('component', () => {
    const createHost = createHostFactory({
      component: DialogComponent,
      declarations: [
        DialogFooterDirective,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MockDirective(MatDialogClose)
      ],
      shallow: true,
      mocks: [MatDialog],
      imports: [TranslocoTestingModule]
    });
    let spectator: SpectatorHost<DialogComponent>;

    it('should contain given title text in the title', () => {
      spectator = createHost(`<sg-dialog titleTranslationKey="some.title"></sg-dialog>`);
      expect(
        spectator.query(MatDialogTitle, { read: ElementRef }).nativeElement
      ).toHaveDescendantWithText({ selector: 'h3', text: 'en.some.title' });
    });

    it('should contain transcluded content', () => {
      spectator = createHost(`<sg-dialog>Transcluded content</sg-dialog>`);
      expect(
        spectator.query(MatDialogContent, { read: ElementRef }).nativeElement
      ).toHaveText('Transcluded content');
    });

    it('should contain close dialog button with undefined payload in the title', () => {
      spectator = createHost(
        `<sg-dialog [closeIconButtonEnabled]="true"></sg-dialog>`
      );
      const closeButton = spectator.query(
        toDataTestAttributeSelector('close-button')
      );
      const matDialogCloseDirective = spectator.query(MatDialogClose);
      const matDialogCloseDirectiveElementRef = spectator.query(
        MatDialogClose,
        { read: ElementRef }
      );

      expect(
        spectator.query(MatDialogTitle, { read: ElementRef }).nativeElement
      ).toHaveDescendant(closeButton);
      expect(closeButton).toBe(matDialogCloseDirectiveElementRef.nativeElement);
      expect(matDialogCloseDirective.dialogResult).toBe(undefined);
    });

    it('should contain divided content', () => {
      spectator = createHost(`<sg-dialog [dividedContent]="true"></sg-dialog>`);
      expect(spectator.query('.top-content-divider')).toExist();
      expect(spectator.query('.bottom-content-divider')).toExist();
      expect(
        spectator.query(MatDialogContent, { read: ElementRef }).nativeElement
      ).toHaveClass('divided');
    });

    describe('dialog actions', () => {
      it(`should match snapshot of a dialog with default actions template
 created from non-observable default actions`, () => {
        spectator = createHost(`<sg-dialog></sg-dialog>`);
        expect(spectator.fixture).toMatchSnapshot();
      });

      it('should contain transcluded custom actions template', () => {
        spectator = createHost(`
      <sg-dialog>
        <mat-dialog-actions>Custom actions template</mat-dialog-actions>
      </sg-dialog>`);
        expect(
          spectator.query(MatDialogActions, { read: ElementRef }).nativeElement
        ).toHaveText('Custom actions template');
      });

      describe('custom input actions', () => {
        const actions = [
          {
            textTranslationKey: 'dismiss',
            dismissing: true,
            payload: false,
            disabled: true,
            dataTest: 'dismiss-action-button'
          },
          {
            textTranslationKey: 'ok.subscribe',
            dismissing: false,
            payload: { subscriptionEmail: 'name@solargis.com' },
            dataTest: 'ok-subscribe-action-button'
          },
          {
            textTranslationKey: 'ok.butDoNotsubscribe',
            dismissing: false,
            payload: true,
            dataTest: 'ok-but-do-not-subscribe-action-button'
          }
        ];
        const actions$: Observable<DialogAction[]> = of(actions);

        beforeEach(() => {
          spectator = createHost(
            `<sg-dialog [actions]="actions"></sg-dialog>`,
            {
              hostProps: {
                actions: actions$
              }
            }
          );
        });

        it('should contain buttons with correctly bound dialog payload attributes', () => {
          const matDialogCloseDirectives = spectator.queryAll(MatDialogClose);
          const matDialogCloseDirectiveElementRefs = spectator.queryAll(
            MatDialogClose,
            { read: ElementRef }
          );
          actions.forEach(({ dataTest, payload }, index) => {
            expect(spectator.query(toDataTestAttributeSelector(dataTest))).toBe(
              matDialogCloseDirectiveElementRefs[index].nativeElement
            );
            expect(matDialogCloseDirectives[index].dialogResult).toBe(payload);
          });
        });

        it(`should match snapshot of a dialog with actions template created
 from observable actions input`, () => {
          expect(spectator.fixture).toMatchSnapshot();
        });
      });
    });

    it('should add and remove transcluded footer with divider', () => {
      spectator = createHost(
        `
      <sg-dialog>
        <sg-dialog-footer *ngIf="footerDisplayed">Transcluded footer content</sg-dialog-footer>
      </sg-dialog>
    `,
        {
          hostProps: {
            footerDisplayed: true
          }
        }
      );
      expect(spectator.query('.footer-divider')).toExist();
      expect(spectator.query('.sg-dialog-footer')).toHaveText(
        'Transcluded footer content'
      );
      spectator.setHostInput({ footerDisplayed: false });
      expect(spectator.query('.footer-divider')).not.toExist();
      expect(spectator.query('.sg-dialog-footer')).not.toExist();
    });
  });
});
