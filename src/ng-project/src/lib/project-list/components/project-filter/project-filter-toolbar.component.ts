import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { defaultProjectFilter, ProjectFilter } from '../../reducers/filter.reducer';

@Component({
  selector: 'sg-project-filter-toolbar',
  template: '<div>{{ "projectList.filter.toolbar." + filterType | transloco:{ tags: tags} }}</div>',
  styles: [`:host {overflow: hidden} div {width: 100%; overflow: hidden; text-overflow: ellipsis}`]
})
export class ProjectFilterToolbarComponent implements OnChanges {

  @Input() filter: ProjectFilter;

  filterType = 'default';
  tags = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filter) {

      if (!this.filter || this.filter === defaultProjectFilter) {this.filterType = 'default';}
      else if (this.filter.recent) {this.filterType = 'recent';}
      else if (this.filter.favorite) {this.filterType = 'favorite';}
      else if (this.filter.archived) {this.filterType = 'archived';}
      else if (this.filter.tags) {
        this.filterType = 'tag';
        this.tags = Object.keys(this.filter.tags).filter(key => this.filter.tags[key]).join(', ');
      } else {this.filterType = 'default';}
    }
  }

}
