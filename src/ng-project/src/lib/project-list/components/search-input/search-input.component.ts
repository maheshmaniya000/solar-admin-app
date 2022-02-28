import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, partition, share, startWith, switchMap, tap } from 'rxjs/operators';

import { geocoord, NegativNumAndCardinalDirectionError } from '@solargis/geosearch';
import { GeocoderService } from '@solargis/ng-geosearch';
import { getToggleKeys$ } from '@solargis/ng-unit-value';
import { LatLng, latlngEquals, latlngToUrlParam, Site } from '@solargis/types/site';
import { latlngUnit, resolveUnitValue } from '@solargis/units';

import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { ExtendedProject } from '../../../project/reducers/projects.reducer';
import { SearchAddToHistory, SearchToggle } from '../../actions/search.actions';
import { State } from '../../reducers';
import { selectFilteredProjects } from '../../selectors';

@Component({
  selector: 'sg-search-input',
  styleUrls: ['./search-input.component.scss'],
  templateUrl: './search-input.component.html'
})
export class SearchInputComponent
  extends SubscriptionAutoCloseComponent
  implements OnInit, OnDestroy {
  @Input() showingSearchResults: boolean;
  @Input() componentName: 'map' | 'list';

  @Output() onSelectSite = new EventEmitter();
  @Output() onShowResults = new EventEmitter();
  @Output() onClearResults = new EventEmitter();
  @Output() onSelectProject = new EventEmitter();
  @Output() foundProjects = new EventEmitter();
  @Output() onSearchQuery = new EventEmitter();

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild('searchInput', { read: MatAutocompleteTrigger, static: true })
  autocompleteTrigger: MatAutocompleteTrigger;

  private latlngToggleKeys: string[];

  latlngUnit = latlngUnit;

  searchControl = new FormControl();

  filteredSites$: Observable<Site[]>;
  waitingForResults$ = new BehaviorSubject(false);
  allowAutocomplete = false;
  isInvalidCoordinate: boolean;

  allProjects$: Observable<ExtendedProject[]>;
  filteredProjects: ExtendedProject[];

  searchHistory$: Observable<string[]>;

  showSearch: boolean;

  constructor(private readonly geocoder: GeocoderService, private readonly store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    // http://stackoverflow.com/questions/32594357/rxjs-modeling-if-else-control-structures-with-observables-operators
    // if else in observable fashion: [ ifObservable, elseObservable ]
    const [query$, ignore$] = partition((search: string) => {
      const ignoreChars = this.componentName === 'map' ? (this.isInvalidCoordinate ? 2 : 3) : 1;
      return search?.length >= ignoreChars;
    })(
      this.searchControl.valueChanges.pipe(
        debounceTime(500),
        tap(() => (this.allowAutocomplete = true))
      )
    );

    this.subscriptions.push(
      this.searchControl.valueChanges.subscribe(value => {
        if (typeof value === 'string') {
          this.onSearchQuery.emit(value);
        }
      })
    );

    this.addSubscription(
      this.store.select('projectList', 'search').subscribe(search => {
        this.showSearch = search.showSearch;
      })
    );

    this.allProjects$ = this.store.pipe(selectFilteredProjects);

    this.addSubscription(
      combineLatest([query$, this.allProjects$]).subscribe(
        ([query, projects]) => {
          query = query.toLowerCase();
          const point = this.geocoder.parse(query);

          this.filteredProjects = projects.filter(project => {
            if (latlngEquals(point, project.site.point)) {return true;}

            let placemarkItems = [];
            if (!!project.site.place && !!project.site.place.placemark) {
              const { placemark } = project.site.place;
              placemarkItems = [placemark.locality, placemark.area, placemark.countryName];
            }
            const matchingValues = [project.name, ...placemarkItems]
              .filter(n => n)
              .map(n => n.toLowerCase());
            return matchingValues.some(item => item.includes(query));
          });
        }
      )
    );

    // search query converted to tuple: query, LatLng point
    // point may be undefined if not valid
    const queryPoint$: Observable<[string, LatLng]> = query$.pipe(
      filter(() => this.componentName === 'map'),
      map(query => [query, this.parseGeoCoordinate(query)] as [string, LatLng])
    );

    // distinct LatLng point parsed from query
    const point$ = queryPoint$.pipe(
      map(([, point]) => point),
      distinctUntilChanged((p1, p2) => latlngEquals(p1, p2)),
      startWith(undefined)
    );

    // valid parsed LatLng point from search query
    const parsedPoint$: Observable<LatLng> = point$.pipe(
      filter(point => !!point),
      map((point: LatLng) => ({ ...point, parsed: true }))
    );

    // valid parsed site, optionally with geocoded address
    const parsed$: Observable<Partial<Site>> = merge(
      parsedPoint$.pipe(map(point => ({ point }))),
      parsedPoint$.pipe(
        switchMap((point: LatLng) => this.geocoder.search(point)),
        filter(sites => !!(sites && sites.length)),
        map(([first]) => ({ ...first, point: { ...first.point, parsed: true } }))
      )
    ).pipe(startWith(undefined));

    // results of geocoding the query
    const geocoded$ = queryPoint$.pipe(
      switchMap(([query, point]) => point ? of() : this.geocoder.search(query)),
      startWith(undefined)
    );

    this.filteredSites$ = merge(
      combineLatest(point$, parsed$, geocoded$).pipe(
        map(([point, parsed, geocoded]) => (point && parsed) ? [parsed] : (geocoded || []))
      ),
      ignore$.pipe(map(() => null)) // clear autocomplete box when input is empty
    ).pipe(share());

    this.searchHistory$ = this.store
      .select('projectList', 'search')
      .pipe(map(search => (search && search.history ? search.history : [])));

    // we need to subscribe to latlng toggleKeys$ because we need
    // synchronous access to print latlng (unit.resolveValue) by current toggle

    this.addSubscription(
      getToggleKeys$(this.latlngUnit, this.store.pipe(selectUnitToggle))
        .subscribe(toggleKeys => (this.latlngToggleKeys = toggleKeys))
    );

    this.addSubscription(
      combineLatest([this.filteredSites$, this.waitingForResults$])
        .pipe(
          filter(([sites]) => sites && !!sites.length),
          filter(([, waiting]) => waiting)
        )
        .subscribe(([sites, waiting]) => {
          if (waiting) {
            this.waitingForResults$.next(false);
          }
          if (sites.length === 1) {this.selectSite(sites[0]);}
          else {this.onShowResults.emit(sites);}
        })
    );
  }

  autocompleteToString(site: Site | string): string {
    if (typeof site === 'string') {
      return site;
    } else if (site) {
      return resolveUnitValue(this.latlngUnit, site.point, this.latlngToggleKeys);
    }
  }

  onSelectFromHistory(): void {
    setTimeout(() => {
      this.autocompleteTrigger.openPanel();
    });
  }

  selectSite(site: Site): void {
    this.onSelectSite.emit(site);
    this.store.dispatch(new SearchAddToHistory(this.searchControl.value));
  }

  selectProject(project: ExtendedProject): void {
    this.onSelectProject.emit(project);
    this.store.dispatch(new SearchAddToHistory(this.searchControl.value));
  }

  startSearch(): void {
    this.searchInput.nativeElement.focus();
    if (!this.showingSearchResults) {
      setTimeout(() => this.autocompleteTrigger.openPanel());
    }
  }

  trackByFn(index: number, item: Site): string {
    return latlngToUrlParam(item.point);
  }

  inputToggle(): void {
    this.store.dispatch(new SearchToggle(!this.showSearch));
  }

  parseGeoCoordinate(query: string): LatLng | undefined {
    this.isInvalidCoordinate = false;
    try {
      return geocoord(query);
    } catch (e) {
      if (e instanceof NegativNumAndCardinalDirectionError) { this.isInvalidCoordinate = true; }
      return undefined;
    }
  }

  // on keydown.escape
  stopSearch(): void {
    this.searchControl.reset();
    this.onClearResults.emit();
  }

  // on keydown.enter
  searchResults(): void {
    if (!this.isInvalidCoordinate) {
      this.allowAutocomplete = false;
      this.waitingForResults$.next(true);
      this.autocompleteTrigger.closePanel();
      this.foundProjects.next(this.filteredProjects);
      this.store.dispatch(new SearchAddToHistory(this.searchControl.value));
    }
  }
}
