import { Component, ElementRef, HostListener, Input, OnChanges, OnInit } from '@angular/core';

import { PvLossDiagramRow } from '@solargis/prospect-detail-calc';

import { findParentElement } from 'ng-shared/utils/dom.utils';

export const arrowFullWidth = 30;
const arrowHeadWidth = 7.99; // works better than 8

@Component({
  selector: 'sg-loss-arrow',
  styleUrls: ['./pv-loss-arrow.component.scss'],
  templateUrl: './pv-loss-arrow.component.html'
})
export class PvLossArrowComponent implements OnInit, OnChanges {

  @Input() loss: PvLossDiagramRow;

  width: number;
  height: number;

  gtiWidth: number;
  prLastRowWidth: number;
  prWidth: number;
  absLossWidth: number;
  arrowBarWidth: number;

  isGain: boolean;

  cellElm: HTMLElement;
  rowElm: HTMLElement;

  constructor(private readonly elm: ElementRef) {}

  @HostListener('window:resize')
  onResize(): void {
    this.updateSize();
  }

  ngOnInit(): void {
    this.cellElm = findParentElement(this.elm.nativeElement, 'cdk-cell');
    this.rowElm = findParentElement(this.cellElm, 'cdk-row');
    this.updateSize();
  }

  ngOnChanges(): void {
    if (this.cellElm) {this.updateSize();}
  }

  private updateSize(): void {
    setTimeout(() => {
      this.width = this.cellElm.offsetWidth;
      this.height = Math.min(this.cellElm.offsetHeight + 1, this.rowElm.offsetHeight);

      this.gtiWidth = this.width - arrowFullWidth;
      if (this.loss) {
        const { pr, prLastRow, energyDelta, energyFirstRow } = this.loss;

        this.isGain = energyDelta > 0;

        // we need to calculate absolute loss percent
        // as loss.lossPercent is calculated from previous row
        const absLossPercent = (energyDelta / energyFirstRow) * 100;

        this.prLastRowWidth = (prLastRow / 100) * this.gtiWidth;
        this.absLossWidth = (this.isGain ? 1 : -1) * (absLossPercent / 100) * this.gtiWidth;
        this.prWidth = (pr / 100) * this.gtiWidth + (this.isGain ? - this.absLossWidth : 0);
        this.arrowBarWidth = this.width - this.prWidth - arrowHeadWidth;
      }

      this.elm.nativeElement.style.width = this.width + 'px';
      this.elm.nativeElement.style.height = this.height + 'px';
    });
  }

}
