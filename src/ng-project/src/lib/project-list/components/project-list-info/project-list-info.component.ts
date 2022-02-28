import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Project } from '@solargis/types/project';

import { State } from '../../reducers';
import { selectSelectedProject, selectIsSelectedMulti } from '../../selectors';

@Component({
  selector: 'sg-project-list-info',
  templateUrl: './project-list-info.component.html',
  styleUrls: ['./project-list-info.component.scss']
})
export class ProjectListInfoComponent implements OnInit {

  isMulti$: Observable<boolean>;
  isSingle$: Observable<boolean>;
  project$: Observable<Project>;

  constructor(private readonly store: Store<State>) {}

  ngOnInit(): void {
    this.isMulti$ = this.store.pipe(selectIsSelectedMulti);
    this.project$ = this.store.pipe(selectSelectedProject);
    this.isSingle$ = this.project$.pipe(
      map(project => !!project && !!project.created)
    );
  }

}
