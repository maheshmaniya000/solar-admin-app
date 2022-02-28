import {
  Component,
  Input,
  NgModule,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';
import { Observable } from 'rxjs';

import { HighlightedBoxComponent } from '../../highlighted-box/highlighted-box.component';
import { DialogAction } from '../model/dialog-action.model';
import { DialogService } from '../service/dialog.service';
import { StandardDialogData } from '../standard-dialog/model/standard-dialog-data.model';
import { DialogStoriesConstants } from './dialog-stories.constants';

@Component({
  selector: 'sg-standard-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="onOpenDialogWithTextContentButtonClick()"
      data-test="open-dialog-with-text-content-button"
    >
      Open dialog with text content
    </button>

    <button
      mat-flat-button
      color="accent"
      (click)="onOpenDialogWithTemplatedContentButtonClick()"
      data-test="open-dialog-with-templated-content-button"
    >
      Open dialog with templated content
    </button>

    <button
      mat-flat-button
      color="accent"
      (click)="onOpenDialogWithComponentContentButtonClick()"
      data-test="open-dialog-with-component-content-button"
    >
      Open dialog with component content
    </button>

    <ng-template #dialogContent>
      The content of this standard dialog is an <b>HTML</b> template with
      <i>HTML</i> elements like for example a list:
      <ul>
        <li>First</li>
        <li>Second</li>
        <li>Third</li>
      </ul>
      The actions of this dialog are default actions of any standard dialog.
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
class StandardDialogStoryComponent {
  @Input() interactiveData: StandardDialogData;
  @ViewChild('dialogContent') dialogContent: TemplateRef<any>;
  payload$: Observable<any>;

  constructor(private readonly dialogService: DialogService) {}

  onOpenDialogWithTextContentButtonClick(): void {
    this.payload$ = this.dialogService.openStandardDialog({
      data: this.interactiveData
    }).afterClosed();
  }

  onOpenDialogWithTemplatedContentButtonClick(): void {
    this.payload$ = this.dialogService.openStandardDialog({
      data: {
        titleTranslationKey: 'Some title',
        content: this.dialogContent
      }
    }).afterClosed();
  }

  onOpenDialogWithComponentContentButtonClick(): void {
    this.payload$ = this.dialogService.openStandardDialog({
      data: {
        titleTranslationKey: 'Some title',
        content: HighlightedBoxComponent
      }
    }).afterClosed();
  }
}

@NgModule({
  declarations: [StandardDialogStoryComponent],
  imports: DialogStoriesConstants.dialogModuleDependencies,
  providers: DialogStoriesConstants.dialogProviders,
  exports: [StandardDialogStoryComponent]
})
class StandardDialogDialogStoryModule {}

export default {
  title: DialogStoriesConstants.storyTitle,
  decorators: [
    moduleMetadata({
      imports: [StandardDialogDialogStoryModule]
    })
  ]
};

export const standard: Story = props => ({
  props,
  template: `<sg-standard-dialog-story [interactiveData]="data"></sg-standard-dialog-story>`
});

standard.argTypes = {
  data: {
    name: 'Standard dialog injection data',
    control: { type: 'object' },
    defaultValue: {
      titleTranslationKey: 'Title',
      content: DialogStoriesConstants.sampleText,
      actions: [
        {
          textTranslationKey: 'Dismiss',
          dismissing: true,
          payload: false,
          dataTest: 'dismiss-action-button'
        },
        {
          textTranslationKey: 'Confirm',
          dismissing: false,
          payload: true,
          dataTest: 'confirm-action-button'
        }
      ] as DialogAction[]
    }
  }
};
