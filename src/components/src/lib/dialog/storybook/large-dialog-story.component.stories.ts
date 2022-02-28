import { Component, NgModule } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';

import { DialogService } from '../service/dialog.service';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-large-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openLargeDialog(basicDialogTemplate)"
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
      (click)="dialogService.openLargeDialog(complicatedDialogTemplate)"
      data-test="open-complicated-dialog-button"
    >
      Complicated
    </button>

    <ng-template #complicatedDialogTemplate>
      <sg-dialog
        titleTranslationKey="Some other longer title"
        [closeIconButtonEnabled]="true"
        [dividedContent]="true"
      >
        <p><b>some HTML content</b> in a paragraph</p>
        {{ text }}{{ text }}{{ text }}{{ text }}{{ text }}{{ text }}{{ text
        }}{{ text }}{{ text }}{{ text }}
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
class LargeDialogStoryComponent {
  readonly text = DialogStoriesConstants.sampleText;

  constructor(readonly dialogService: DialogService) {}
}

@NgModule({
  declarations: [LargeDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [LargeDialogStoryComponent]
})
class LargeDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [
    moduleMetadata({
      imports: [LargeDialogStoryModule]
    })
  ]
};

export const large: Story = () => ({
  template: `<sg-large-dialog-story></sg-large-dialog-story>`
});
