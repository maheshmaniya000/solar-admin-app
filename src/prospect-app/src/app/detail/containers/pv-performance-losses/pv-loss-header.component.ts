import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { DataLayer } from '@solargis/dataset-core';
import { AnnualDataMap } from '@solargis/types/dataset';

import { findParentElement } from 'ng-shared/utils/dom.utils';

import { arrowFullWidth } from './pv-loss-arrow.component';

@Component({
  selector: 'sg-loss-header',
  templateUrl: './pv-loss-header.component.html'
})
export class PvLossHeaderComponent implements OnInit, OnChanges {

  @Input() data: AnnualDataMap;
  @Input() layer: DataLayer;

  gtiWidth: number;
  prWidth: number;
  prLabelWidth = 30;

  headerCellElm: HTMLElement;

  constructor(private readonly elm: ElementRef) {}

  @HostListener('window:resize')
  onResize(): void {
    this.updateSize();
  }

  ngOnInit(): void {
    this.headerCellElm = findParentElement(this.elm.nativeElement, 'cdk-header-cell');
    this.updateSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {this.updateSize();}
  }

  // partial copy-paste from pv-loss-arrow.component.ts
  private updateSize(): void {
    setTimeout(() => {
      const width = this.headerCellElm.offsetWidth - arrowFullWidth;
      this.gtiWidth = width;

      if (this.data) {
        const { PR } = this.data;
        this.prWidth = (PR / 100) * this.gtiWidth;
      }
      this.elm.nativeElement.style.width = width + 'px';
    });
  }

}
