import { Component, NgModule } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';

import { DialogService } from '../service/dialog.service';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-medium-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openMediumDialog(basicDialogTemplate)"
      data-test="open-basic-dialog-button"
    >
      Basic
    </button>

    <ng-template #basicDialogTemplate>
      <sg-dialog titleTranslationKey="Some title">
        {{ text }}
      </sg-dialog>
    </ng-template>

    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openMediumDialog(dividedContentDialogTemplate)"
      data-test="open-dialog-with-divided-content-button"
    >
      Divided content
    </button>

    <ng-template #dividedContentDialogTemplate>
      <sg-dialog titleTranslationKey="Some title" [dividedContent]="true">
        <p><b>some HTML content</b> in a paragraph</p>
        {{ text }}{{ text }}{{ text }}{{ text }}{{ text }}{{ text }}{{ text
        }}{{ text }}{{ text }}{{ text }}
      </sg-dialog>
    </ng-template>

    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openMediumDialog(closableIconDialogTemplate)"
      data-test="open-dialog-with-closable-icon-button"
    >
      Closable icon
    </button>

    <ng-template #closableIconDialogTemplate>
      <sg-dialog titleTranslationKey="Some title" [closeIconButtonEnabled]="true">
        {{ text }}
      </sg-dialog>
    </ng-template>

    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openMediumDialog(footerDialogTemplate)"
      data-test="open-dialog-with-footer-button"
    >
      Footer
    </button>

    <ng-template #footerDialogTemplate>
      <sg-dialog titleTranslationKey="Some title">
        {{ text }}
        <sg-dialog-footer>Footer content</sg-dialog-footer>
      </sg-dialog>
    </ng-template>
  `,
  styles: [
    `
      button {
        margin-left: 15px;
      }
    `
  ]
})
class MediumDialogStoryComponent {
  readonly text = DialogStoriesConstants.sampleText;

  constructor(readonly dialogService: DialogService) {}
}

@NgModule({
  declarations: [MediumDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [MediumDialogStoryComponent]
})
class MediumDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [
    moduleMetadata({
      imports: [MediumDialogStoryModule]
    })
  ]
};

export const medium: Story = () => ({
  template: `<sg-medium-dialog-story></sg-medium-dialog-story>`
});
