import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isEmpty } from 'lodash-es';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'sg-admin-toolbar-search',
  templateUrl: './admin-toolbar-search.component.html',
  styleUrls: ['./admin-toolbar-search.component.scss']
})
export class AdminToolbarSearchComponent implements OnChanges, OnInit {
  @Input() search: string;
  @Input() placeholder: string;
  @Output() searchChange = new EventEmitter<string>();

  searchFormControl = new FormControl('');

  ngOnChanges(): void {
    this.searchFormControl.setValue(this.search, { emitEvent: false});
  }

  ngOnInit(): void {
    this.searchFormControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(search => {
      if (isEmpty(search)) {
        this.searchChange.emit('');
      } else if (search.length >= 2) {
        this.searchChange.emit(search);
      }
    });
  }
}
