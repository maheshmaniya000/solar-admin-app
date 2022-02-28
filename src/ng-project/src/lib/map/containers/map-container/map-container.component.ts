import { Component, HostListener, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { selectIsSelectedMulti } from 'ng-project/project-list/selectors';
import { ExtendedProject } from 'ng-project/project/reducers/projects.reducer';
import { selectAlertsCount } from 'ng-shared/core/selectors/alerts.selector';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';

import { State } from '../../map.reducer';


@Component({
  selector: 'sg-map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss']
})
export class MapContainerComponent implements OnInit {
  mapSidebarWidth = 442;
  sidebarMinVisibleHeight = 160;
  mapViewHeight = 460;

  isMulti$: Observable<boolean>;
  displayTrialBar$: Observable<boolean>;

  alertBarHeight$: Observable<number>;

  projects: ExtendedProject[];

  constructor(private readonly store: Store<State>) {}

  @HostListener('window:resize')
  onResize = (): void => this.setMapViewHeight();

  ngOnInit(): void {
    this.setMapViewHeight();

    this.isMulti$ = this.store.pipe(selectIsSelectedMulti);

    this.displayTrialBar$ = this.store.pipe(selectActiveOrNoCompany).pipe(
      map(company => company && (!company.prospectLicense || company.prospectLicense.licenseType === 'FREE_TRIAL'))
    );

    this.alertBarHeight$ = this.store.pipe(
      selectAlertsCount('prospect/map'),
      map(count => count * 36) // TODO: name the magic number
    );
  }

  setMapViewHeight(): void {
    this.mapViewHeight = window.innerHeight - this.sidebarMinVisibleHeight - 68; // TODO: name the magic number
  }

  foundProjects(projects: ExtendedProject[]): void {
    this.projects = projects;
  }
}
