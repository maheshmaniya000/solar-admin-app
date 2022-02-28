import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { DataLayer } from '@solargis/dataset-core';

export type CompareChips = { [key: string]: boolean };

@Component({
  selector: 'sg-chips-selector',
  templateUrl: './chips-selector.component.html',
  styleUrls: ['./chips-selector.component.scss']
})
export class ChipsSelectorComponent implements OnInit, OnChanges {

  @Input() layers: DataLayer[];
  @Input() layersWithPerm: DataLayer[];
  @Input() defaultSelectedChips: CompareChips;
  @Output() onSelect = new EventEmitter<CompareChips>();

  allSelected = false;

  hasPerm: CompareChips = {};
  selectedChips: CompareChips;

  ngOnInit(): void {
    this.selectedChips = { ...this.defaultSelectedChips };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.layersWithPerm) {
      this.hasPerm = this.layersWithPerm.reduce((acc, l) => {
        acc[l.key] = true;
        return acc;
      }, {});
    }
  }

  chipClick(option: string): void {
    if (this.hasPerm[option]) {
      this.selectedChips[option] = !this.selectedChips[option];
      this.updateAllSelected();
    }
  }

  selectDefaultChips(): void {
    this.layersWithPerm.forEach(layer => this.selectedChips[layer.key] = this.defaultSelectedChips[layer.key]);
    this.updateAllSelected();
  }

  selectAllChips(allowed: boolean): void {
    this.layersWithPerm.forEach(layer => this.selectedChips[layer.key] = allowed);
    this.updateAllSelected();
  }

  updateAllSelected(): void {
    if (this.layersWithPerm.map(layer => this.selectedChips[layer.key]).every(Boolean)) {this.allSelected = true;}
    else {this.allSelected = false;}
    this.onSelect.emit(this.selectedChips);
  }
}
