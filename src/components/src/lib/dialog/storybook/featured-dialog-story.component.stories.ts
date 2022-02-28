import { Component, NgModule } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';

import { DialogService } from '../service/dialog.service';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-featured-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="dialogService.openFeaturedDialog(basicDialogTemplate)"
      data-test="open-basic-dialog-button"
    >
      Basic
    </button>

    <ng-template #basicDialogTemplate>
      <sg-dialog [closeIconButtonEnabled]="true">
        <h1>Some title</h1>
        {{ text }}
        <sg-dialog-footer>Footer content</sg-dialog-footer>
      </sg-dialog>
    </ng-template>
  `
})
class FeaturedDialogStoryComponent {
  readonly text = DialogStoriesConstants.sampleText;

  constructor(readonly dialogService: DialogService) {}
}

@NgModule({
  declarations: [FeaturedDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [FeaturedDialogStoryComponent]
})
class FeaturedDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [
    moduleMetadata({
      imports: [FeaturedDialogStoryModule]
    })
  ]
};

export const featured: Story = () => ({
  template: `<sg-featured-dialog-story></sg-featured-dialog-story>`
});
