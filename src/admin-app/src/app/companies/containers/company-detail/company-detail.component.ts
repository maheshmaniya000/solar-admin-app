import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { ComponentMode } from '../../../shared/models/component-mode.enum';
import { SaveableComponent } from '../../../shared/models/saveable-component.model';
import { fromAdmin } from '../../../store';
import { CompanyDetailStore } from '../../services/company-detail.store';
import { CompaniesSelectors } from '../../store';

@Component({
  styleUrls: ['../../../shared/components/admin-common.styles.scss'],
  templateUrl: './company-detail.component.html',
  providers: [CompanyDetailStore]
})
export class CompanyDetailComponent implements OnInit, SaveableComponent {
  readonly componentMode = ComponentMode;
  mode: ComponentMode;
  headerLabel: Record<ComponentMode, string> = {
    [ComponentMode.add]: 'Add company',
    [ComponentMode.view]: 'View company',
    [ComponentMode.edit]: 'Edit company'
  };

  constructor(
    readonly companyDetailStore: CompanyDetailStore,
    private readonly store: Store<fromAdmin.State>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.mode = this.activatedRoute.snapshot.data.mode;
    if (this.mode !== ComponentMode.add) {
      this.companyDetailStore.setEntity(
        this.store.select(CompaniesSelectors.selectSelected).pipe(map(company => removeEmpty(company, true, true, true)))
      );
    }
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  hasUnsavedChanges(): Observable<boolean> {
    return this.companyDetailStore.unsavedChanges$;
  }
}
