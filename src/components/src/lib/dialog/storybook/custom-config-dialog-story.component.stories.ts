import { Component, Input, NgModule } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';

import { DialogService } from '../service/dialog.service';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-custom-config-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="
        dialogService.openMediumDialog(customConfigDialogTemplate, {
          disableClose: disableClose
        })
      "
      data-test="open-dialog-with-custom-config"
    >
      Dialog with custom config
    </button>

    <ng-template #customConfigDialogTemplate>
      <sg-dialog titleTranslationKey="Some title" [closeIconButtonEnabled]="true">
        {{ text }}
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
class CustomConfigDialogStoryComponent {
  readonly text = DialogStoriesConstants.sampleText;

  @Input() disableClose: boolean;

  constructor(readonly dialogService: DialogService) {}
}

@NgModule({
  declarations: [CustomConfigDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [CustomConfigDialogStoryComponent]
})
class CustomConfigDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [moduleMetadata({ imports: [CustomConfigDialogStoryModule] })]
};

export const customConfig: Story = props => ({
  props,
  template: `<sg-custom-config-dialog-story [disableClose]="disableClose"></sg-custom-config-dialog-story>`
});

customConfig.argTypes = {
  disableClose: {
    name: 'Disable close',
    control: { type: 'boolean' },
    defaultValue: true
  }
};
