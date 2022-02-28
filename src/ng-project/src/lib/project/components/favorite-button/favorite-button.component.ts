import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { ProjectId, Project } from '@solargis/types/project';

import { State } from '../../reducers';

type FavoriteButtonSize = 'normal' | 'small' | 'tiny';

@Component({
  selector: 'sg-favorite-button',
  styleUrls: ['./favorite-button.component.scss'],
  template: `
  <button mat-icon-button
    (click)="setFavorite(project._id, !project['favorite'])" [ngClass]="size">
    <mat-icon [ngClass]="{'favorite': project['favorite']}">
      {{ project['favorite'] ? 'star' : 'star_border' }}
    </mat-icon>
  </button>`
})
export class FavoriteButtonComponent {

  @Input() size: FavoriteButtonSize;
  @Input() project: Project;

  constructor(private readonly store: Store<State>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFavorite(id: ProjectId, favorite: boolean): void {
    // this.store.dispatch(new SiteUpdate(id, { favorite })); // TODO user-tags
  }
}
