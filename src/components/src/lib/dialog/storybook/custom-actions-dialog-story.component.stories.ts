import { Component, Input, NgModule, TemplateRef } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';
import { merge, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { DialogComponent } from '../dialog.component';
import { DialogConstants } from '../dialog.constants';
import { DialogAction } from '../model/dialog-action.model';
import { DialogService } from '../service/dialog.service';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-custom-actions-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="onOpenDialogButtonClick(actionsProvidedByInputDialogTemplate)"
      data-test="actions-provided-by-input-button"
    >
      Actions provided by input
    </button>

    <ng-template #actionsProvidedByInputDialogTemplate>
      <sg-dialog titleTranslationKey="Some title" [actions]="actions">
        {{ text }}
      </sg-dialog>
    </ng-template>

    <button
      mat-flat-button
      color="accent"
      (click)="
        onOpenDialogButtonClick(
          asynchronousActionsProvidedByInputDialogTemplate
        )
      "
      data-test="async-actions-provided-by-input-button"
    >
      Asynchronous actions provided by input
    </button>

    <ng-template #asynchronousActionsProvidedByInputDialogTemplate>
      <sg-dialog titleTranslationKey="Some title" [actions]="asynchronousActions$">
        {{ text }}
      </sg-dialog>
    </ng-template>

    <button
      mat-flat-button
      color="accent"
      (click)="onOpenDialogButtonClick(actionsProvidedByTemplateDialogTemplate)"
      data-test="actions-provided-by-template-button"
    >
      Actions provided by template
    </button>

    <ng-template #actionsProvidedByTemplateDialogTemplate>
      <sg-dialog titleTranslationKey="Some title">
        {{ text }}
        <mat-dialog-actions align="end">
          <button
            mat-stroked-button
            color="accent"
            mat-dialog-close="You closed the dialog with dismiss button"
            data-test="dismiss-button"
          >
            Dismiss
          </button>
          <button
            mat-flat-button
            color="accent"
            (click)="onNextButtonClick()"
            data-test="next-button"
          >
            Next
          </button>
          <button
            mat-flat-button
            color="accent"
            [mat-dialog-close]="{
              a: 'Complex payload you closed the dialog with',
              b: { c: [5, 155] }
            }"
            cdkFocusInitial
            data-test="confirm-button"
          >
            Confirm
          </button>
        </mat-dialog-actions>
      </sg-dialog>
    </ng-template>

    <br /><br />
    <div data-test="payload-container">
      Dialog has closed with this payload: {{ payload$ | async | json }}
    </div>
  `,
  styles: [
    `
      button {
        margin-left: 15px;
      }
    `
  ]
})
class CustomActionsDialogStoryComponent {
  @Input() actions: DialogAction[];
  readonly text = DialogStoriesConstants.sampleText;
  payload$: Observable<any>;
  asynchronousActions$: Observable<DialogAction[]>;

  constructor(private readonly dialogService: DialogService) {}

  onOpenDialogButtonClick(dialogTemplate: TemplateRef<DialogComponent>): void {
    this.asynchronousActions$ = merge(
      of([
        {
          ...DialogConstants.confirmAction,
          textTranslationKey: 'Loading...',
          disabled: true,
          dataTest: 'loading-ok-action-button'
        }
      ]),
      of([DialogConstants.actions.ok]).pipe(delay(5000))
    );
    this.payload$ = this.dialogService.openLargeDialog(dialogTemplate).afterClosed();
  }

  onNextButtonClick(): void {
    alert(`
      You clicked on an action button that does not close the dialog with a payload.
      It does something totally else, like for example opens next page in case the dialog contains stepper form.
    `);
  }
}

@NgModule({
  declarations: [CustomActionsDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [CustomActionsDialogStoryComponent]
})
class CustomActionsDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [
    moduleMetadata({
      imports: [CustomActionsDialogStoryModule]
    })
  ]
};

export const customActions: Story = props => ({
  props,
  template: `<sg-custom-actions-dialog-story [actions]="actions"></sg-custom-actions-dialog-story>`
});

customActions.argTypes = {
  actions: {
    name: 'Dialog actions',
    control: { type: 'object' },
    defaultValue: [
      {
        textTranslationKey: 'Dismiss',
        dismissing: true,
        payload: false,
        dataTest: 'dismiss-action-button'
      },
      {
        textTranslationKey: 'Disabled',
        dismissing: false,
        payload: 11,
        disabled: true,
        dataTest: 'disabled-action-button'
      },
      {
        textTranslationKey: 'Subscribe',
        dismissing: false,
        payload: { subscriptionEmail: 'name@solargis.com' },
        dataTest: 'subscribe-action-button'
      },
      {
        textTranslationKey: `Unsubscribe`,
        dismissing: false,
        payload: true,
        dataTest: 'unsubscribe-action-button'
      }
    ] as DialogAction[]
  }
};
