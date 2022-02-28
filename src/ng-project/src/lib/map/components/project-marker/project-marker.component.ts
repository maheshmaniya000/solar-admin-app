import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

import { Dataset, isLayerCodelistValue } from '@solargis/dataset-core';
import { getProjectAnnualData, ProjectId } from '@solargis/types/project';
import { Unit } from '@solargis/units';

import { ClearHighlight, Highlight } from 'ng-project/project-list/actions/highlight.actions';
import { Select, Unselect } from 'ng-project/project-list/actions/selected.actions';
import { selectIsSelectedMulti } from 'ng-project/project-list/selectors';
import { SaveSite } from 'ng-project/project/actions/project.actions';
import { selectProjectById } from 'ng-project/project/reducers';
import { ExtendedProject, getProjectProgress } from 'ng-project/project/reducers/projects.reducer';
import { LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';
import { distinctProjectById } from 'ng-project/project/utils/distinct-project.operator';
import { ProspectAppConfig } from 'ng-shared/config';
import { RequireUserLogin } from 'ng-shared/user/actions/auth.actions';

import { State } from '../../map.reducer';
import { selectMapSelectedDataKey } from '../../selectors';

type ValueStatus = 'IN_PROGRESS' | 'HAS_VALUE' | 'NO_VALUE' | 'CODELIST_VALUE';

@Component({
  selector: 'sg-project-marker',
  styleUrls: ['./project-marker.component.scss'],
  templateUrl: './project-marker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectMarkerComponent implements OnInit, OnDestroy, AfterViewInit {
  mouseover$ = new BehaviorSubject(undefined);

  multiSelectActive$: Observable<boolean>;
  multiSelected: boolean;
  showCheckbox$: Observable<boolean>;
  showRight$: Observable<boolean>;

  selected$: Observable<boolean>;
  saved$: Observable<boolean>;
  saveInProgress$: Observable<boolean>;

  unit$: Observable<Unit>;

  value$: Observable<any>;
  valueStatus$: Observable<ValueStatus>;
  saveButtonActive$: Observable<boolean>;

  project$: Observable<ExtendedProject>;
  placemark$: Observable<any>;
  showLargeMarkers$: Observable<boolean>;

  isFavorite: boolean;

  subscriptions: Subscription[] = [];

  // callback set from map.component to detach marker from angular2 core on destroy event
  onDestroyCallback: () => void;

  @ViewChild('marker', { static: true })
  marker: ElementRef;

  constructor(private readonly elm: ElementRef,
              private readonly config: ProspectAppConfig,
              private readonly store: Store<State>,
              @Inject('projectId') private readonly projectId: ProjectId,
              @Inject(LTA_DATASET) private readonly ltaDataset: Dataset) {}

  ngOnInit(): void {
    const dataLayer$ = this.store.pipe(
      selectMapSelectedDataKey,
      map(dataKey => dataKey || this.config.data.defaultLayerKey),
      map(layerKey => this.ltaDataset.annual.get(layerKey))
    );

    const projectListSelected$ = this.store.select('projectList', 'selected');

    this.showLargeMarkers$ = this.store.select('map', 'showLargeMarkers');

    this.selected$ = projectListSelected$.pipe(
      map(selected => selected.single === this.projectId || selected.multi.includes(this.projectId)),
      distinctUntilChanged()
    );

    this.project$ = this.store.pipe(selectProjectById(this.projectId));

    const ltaAnnualData$ = this.project$.pipe(
      map(project => getProjectAnnualData(project, 'prospect', 'lta'))
    );

    this.saved$ = this.project$.pipe(
      distinctProjectById(),
      map(project => project && !!project.created),
      startWith(false)
    );

    this.saveInProgress$ = this.project$.pipe(
      map(project => getProjectProgress(project).save),
      distinctUntilChanged()
    );

    const dataLayerWithValue$ = combineLatest(dataLayer$, ltaAnnualData$).pipe(
      map(([layer, lta]) => layer && lta && lta.data
        ? { layer, value: lta.data[layer.key] }
        : { layer }
      )
    );

    this.value$ = dataLayerWithValue$.pipe(map(({ value }) => value));
    this.unit$ = dataLayer$.pipe(map(layer => layer && layer.unit));

    const valueInProgress$ = this.project$.pipe(
      map(project => getProjectProgress(project).siteData),
      distinctUntilChanged()
    );

    this.valueStatus$ = combineLatest(
      dataLayerWithValue$,
      valueInProgress$
    ).pipe(
      map(([{ layer, value }, inProgress]) => {
        if (inProgress) {return 'IN_PROGRESS';}
        if (typeof value === 'undefined') {return 'NO_VALUE';}
        return isLayerCodelistValue(layer, value) ? 'CODELIST_VALUE' : 'HAS_VALUE';
      }),
      distinctUntilChanged()
    ) as Observable<ValueStatus>;

    this.saveButtonActive$ = combineLatest([this.saved$, this.saveInProgress$, ltaAnnualData$]).pipe(
      map(([saved, saveInProgress, ltaAnnualData]) =>
        !saved && !saveInProgress && ltaAnnualData?.data?.GHI
      )
    );

    this.placemark$ = this.project$.pipe(
      filter(project => !!(project.site.place && project.site.place.placemark)),
      map(project => project.site.place.placemark)
    );

    this.multiSelectActive$ = this.store.pipe(selectIsSelectedMulti);

    this.subscriptions.push(
      projectListSelected$.pipe(
        map(selected => selected.multi.includes(this.projectId))
      )
      .subscribe(isMultiSelected => this.multiSelected = isMultiSelected)
    );

    this.showCheckbox$ = combineLatest(this.saved$, this.multiSelectActive$, this.mouseover$).pipe(
      map(([saved, isMultiSelectActive, mouseover]) => saved && (isMultiSelectActive || mouseover))
    );

    this.showRight$ = combineLatest(this.saved$, this.mouseover$).pipe(
      map(([saved, mouseover]) => saved && mouseover)
    );
  }

  ngAfterViewInit(): void {
    this.adjustMarker();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.mouseover$.next(true);
    this.store.dispatch(new Highlight(this.projectId));
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.mouseover$.next(false);
    this.store.dispatch(new ClearHighlight());
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.multiSelected) {
      this.store.dispatch(new Unselect(this.projectId));
    } else {
      this.store.dispatch(new Select({ project: this.projectId }));
    }

    event.stopPropagation();
  }

  onOpenDetail(event: MouseEvent): void {
    this.onMouseLeave();
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.onDestroyCallback();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private adjustMarker(): void {
    // height of bottom arrow of marker (CSS value)
    const arrowHeight = 8;
    // align in px from left corner
    const alignWidth = 26;

    const parentElement = this.elm.nativeElement.parentElement;
    if (parentElement) {
      const height = this.marker.nativeElement.offsetHeight + arrowHeight;
      parentElement.style.margin = `-${height}px  0 0 -${alignWidth}px`;
    }
  }

  addToProjects(): void {
    const action = new RequireUserLogin(new SaveSite(this.projectId));
    this.store.dispatch(action);
  }

  onMultiSelectChange(event: MatCheckboxChange): void {
    if (event.checked) {
      this.store.dispatch(new Select({ project: this.projectId, multi: true }));
    } else {
      this.store.dispatch(new Unselect(this.projectId));
    }
  }
}
