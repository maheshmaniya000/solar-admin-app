import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ComponentMode } from '../../../shared/models/component-mode.enum';
import { SaveableComponent } from '../../../shared/models/saveable-component.model';
import { fromAdmin } from '../../../store';
import { UserDetailStore } from '../../services/user-detail.store';
import { UsersSelectors } from '../../store';

@Component({
  templateUrl: './user-detail.component.html',
  providers: [UserDetailStore]
})
export class UserDetailComponent implements OnInit, SaveableComponent {
  readonly componentMode = ComponentMode;
  mode: ComponentMode;
  headerLabel: Record<ComponentMode, string> = {
    [ComponentMode.add]: 'Add user',
    [ComponentMode.view]: 'View user',
    [ComponentMode.edit]: 'Edit user'
  };

  constructor(
    readonly userDetailStore: UserDetailStore,
    private readonly store: Store<fromAdmin.State>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.mode = this.activatedRoute.snapshot.data.mode;
    if (this.mode !== ComponentMode.add) {
      this.userDetailStore.setEntity(this.store.select(UsersSelectors.selectDetail));
    }
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  hasUnsavedChanges(): Observable<boolean> {
    return this.userDetailStore.unsavedChanges$;
  }
}
