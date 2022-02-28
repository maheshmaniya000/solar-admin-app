import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { Site } from '@solargis/types/site';
import { latlngUnit } from '@solargis/units';

import { ExtendedProject } from '../../../project/reducers/projects.reducer';
import { SearchClearHighlight, SearchHighlight } from '../../actions/search.actions';
import { State } from '../../reducers';

@Component({
  selector: 'sg-search-results',
  styleUrls: ['./search-results.component.scss'],
  templateUrl: './search-results.component.html'
})
export class SearchResultsComponent {

  @Input() searchResults: Site[];
  @Input() highlightIndex: number;
  @Input() searchedProjects: ExtendedProject[];

  @Output() onSelectSite = new EventEmitter();
  @Output() onSelectProject = new EventEmitter();


  latlngUnit = latlngUnit;

  constructor(private readonly store: Store<State>) {
  }

  setHighlightIndex(index: number): void {
    this.store.dispatch(new SearchHighlight(index));
  }

  clearHighlightIndex(): void {
    this.store.dispatch(new SearchClearHighlight());
  }
  // TODO scroll on highlight - reimplement scroll-if directive from worldbank-atlas

}
