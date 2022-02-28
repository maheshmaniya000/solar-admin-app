import { Component, Input, HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, pairwise, throttleTime } from 'rxjs/operators';

/*
 * @deprecated - use dialog component from the components library
 */
@Component({
  selector: 'sg-dialog-deprecated',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss', './auth-dialog.styles.scss']
})
export class DialogComponent implements AfterViewInit {
  @Input() large = false;
  @Input() minWidth: number;

  @ViewChild('contentWrapper')
  contentWrapper: ElementRef;

  @ViewChild('content')
  content: ElementRef;

  showSeparator = false;
  isScroolHeader = false;

  constructor(private readonly cdRef: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.updateSeparator();
    this.cdRef.detectChanges();
    const content = document.querySelector('.table-wrapper');
    const scroll$ = fromEvent(content, 'scroll').pipe(
      throttleTime(10),
          map(() => content.scrollTop),
      pairwise(),
      map(([y1, y2]) => (y2 < y1 ? this.isScroolHeader = true : this.isScroolHeader = false )),
      );
    scroll$.subscribe();
  }

  @HostListener('window:resize')
  updateSeparator(): void {
    this.showSeparator = this.contentWrapper.nativeElement.offsetHeight < this.content.nativeElement.offsetHeight;
  }
}
