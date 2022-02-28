import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ExtendedProject, getProjectMetadataStatus } from '../../reducers/projects.reducer';

@Component({
  selector: 'sg-project-name-with-status',
  templateUrl: './project-name-with-status.component.html',
  styleUrls: ['./project-name-with-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectNameWithStatusComponent {
  @Input() project: ExtendedProject;

  dataNotLatestIconVisible(): boolean {
    return getProjectMetadataStatus(this.project, 'prospect').latest === false;
  }
}
