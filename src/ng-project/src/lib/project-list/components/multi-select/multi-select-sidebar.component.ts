import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Project, ProjectId } from '@solargis/types/project';

@Component({
  selector: 'sg-multi-select-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-select-sidebar.component.html',
  styleUrls: ['./multi-select-sidebar.component.scss']
})
export class MultiSelectSidebarComponent {

  @Input() selectedProjects: Project[];

  @Output() onUnselect = new EventEmitter<ProjectId>();

}
