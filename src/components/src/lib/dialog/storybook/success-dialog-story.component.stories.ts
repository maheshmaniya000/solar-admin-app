import { Component, Input, NgModule } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';

import { DialogConstants } from '../dialog.constants';
import { DialogService } from '../service/dialog.service';
import { SuccessDialogData } from '../success-dialog/models/success-dialog-data.model';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-success-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openSuccessDialog(interactiveData)"
      data-test="open-success-dialog-button"
    >
      Open success dialog
    </button>
  `
})
class SuccessDialogStoryComponent {
  @Input() interactiveData: SuccessDialogData;

  constructor(readonly dialogService: DialogService) {}
}

@NgModule({
  declarations: [SuccessDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [SuccessDialogStoryComponent]
})
class SuccessDialogDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [
    moduleMetadata({
      imports: [SuccessDialogDialogStoryModule]
    })
  ]
};

export const success: Story = props => ({
  props,
  template: `<sg-success-dialog-story [interactiveData]="data"></sg-success-dialog-story>`
});

const defaultValue: SuccessDialogData = {
  imageUrl: 'assets/img/success.svg',
  imageAltTextTranslationKey: 'success image',
  headerTranslationKey: 'Success!',
  textTranslationKey: DialogStoriesConstants.sampleText,
  actions: [DialogConstants.actions.ok]
};

success.argTypes = {
  data: {
    name: 'Success dialog data',
    control: { type: 'object' },
    defaultValue
  }
};
