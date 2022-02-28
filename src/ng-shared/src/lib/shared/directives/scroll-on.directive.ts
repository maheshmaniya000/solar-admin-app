import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

// by size (alternatively by style.overflowY, window.getComputedStyle(elm).overflowY)
function isElementScrollable(elm): boolean {
  return elm.scrollHeight > elm.offsetHeight;
}

function findScrollableElm(elm): any {
  if (isElementScrollable(elm)) {return elm;}
  else if (elm.parentElement) {
    return findScrollableElm(elm.parentElement);
  }
}

// https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport(el): boolean {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  return (
    top >= 0 &&
    left >= 0 &&
    bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}


@Directive({
  selector: '[sgScrollOn]'
})
export class ScrollOnDirective implements OnChanges {

  @Input('sgScrollOn')
  scrollOn: boolean;

  private mouseover = false;

  constructor(private readonly el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.scrollOn && this.scrollOn) {
      if (this.mouseover || isElementInViewport(this.el.nativeElement)) {return;}
      this.scrollToElement();
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.mouseover = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.mouseover = false;
  }

  private scrollToElement(): void {
    // http://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move
    const elm = this.el.nativeElement;
    const scrollableElm = findScrollableElm(elm);
    scrollableElm.scrollTop = elm.offsetTop - scrollableElm.offsetTop;
  }
}
