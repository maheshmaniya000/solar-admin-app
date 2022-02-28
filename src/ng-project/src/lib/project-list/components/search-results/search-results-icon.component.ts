import { AfterViewInit, Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { State } from '../../../map/map.reducer';
import { SearchState } from '../../reducers/search.reducer';

@Component({
  selector: 'sg-search-results-icon',
  styleUrls: ['./search-results-icon.component.scss'],
  templateUrl: './search-results-icon.component.html'
})
export class SearchResultsIconComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() index: number;
  @Input() isMapMarker = true;

  highlight$: Observable<boolean>;

  lastWidth = 0;
  lastHeight = 0;

  // callback set from map.component to detach marker from angular2 core on destroy event
  onDestroyCallback: () => void;

  @ViewChild('marker', { static: true })
  marker: ElementRef;

  constructor(private readonly root: ElementRef, private readonly store: Store<State>) {
  }

  ngOnInit(): void {
    this.highlight$ = this.store.select('projectList', 'search')
      .pipe(
        map((search: SearchState) => search ? search.highlightIndex === this.index : undefined),
        distinctUntilChanged()
      );
  }

  ngAfterViewInit(): void {
    if (this.isMapMarker) {
      this.adjustMarker();
    }
  }
  ngOnDestroy(): void {
    if (this.isMapMarker) {
      this.onDestroyCallback();
    }
  }

  adjustMarker(): void {
    // height of bottom arrow of marker
    const arrowHeight = 0;

    const width = this.marker.nativeElement.offsetWidth;
    const height = this.marker.nativeElement.offsetHeight + arrowHeight;
    const parentElement = this.root.nativeElement.parentElement;

    if ((width !== this.lastWidth || height !== this.lastHeight) && parentElement) {
      this.root.nativeElement.parentElement.style.margin = `-${height}px  0 0 -${width / 2}px`;
      this.lastWidth = width;
      this.lastHeight = height;
    }
  }
}
