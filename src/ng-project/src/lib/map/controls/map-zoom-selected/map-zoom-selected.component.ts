import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Project } from '@solargis/types/project';
import { isEmpty, removeEmptyItems } from '@solargis/types/utils';

import { sitesToLatLngBounds } from 'ng-project/map/utils/leaflet-utils';
import { selectFilteredProjects, selectFilteredSelectedProjects, selectSelectedProject } from 'ng-project/project-list/selectors';

import { MapComponent } from '../../components/map.component';
import { State } from '../../map.reducer';
import { CustomControlComponent } from '../custom-control.component';

@Component({
  selector: 'sg-map-zoom-selected',
  templateUrl: './map-zoom-selected.component.html',
  styleUrls: ['./map-zoom-selected.component.scss']
})

export class MapZoomSelectedComponent extends CustomControlComponent implements OnInit, OnDestroy {

  projects: Project[];
  selected: Project[];

  subscriptions: Subscription[] = [];

  @Output() onAction = new EventEmitter();

  constructor(mapComponent: MapComponent, el: ElementRef, private readonly store: Store<State>) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);

    this.subscriptions.push(
      this.store.pipe(selectFilteredProjects)
        .subscribe(projects => this.projects = projects)
    );

    this.subscriptions.push(
      combineLatest(
        this.store.pipe(selectFilteredSelectedProjects),
        this.store.pipe(selectSelectedProject)
      ).pipe(
        map(([multi, single]) => !isEmpty(multi) ? multi : removeEmptyItems([single]))
      ).subscribe(selected => this.selected = selected)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  zoomSelected(): void {
    this.onAction.emit('zoom_selected_projects');
    this.zoom(this.selected);
  }

  zoomAll(): void {
    this.onAction.emit('zoom_all_projects');
    this.zoom(this.projects);
  }

  private zoom(projects: Project[]): void {
    if (projects.length) {
      const bounds = sitesToLatLngBounds(projects.map(p => p.site));
      this.map.fitBounds(bounds, { maxZoom: 19 });
    }
  }

}
