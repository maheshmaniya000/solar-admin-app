import { Directive, ElementRef, AfterViewChecked, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[sgScrollContainer]'
})
export class ScrollContainerDirective implements AfterViewChecked {

  @Input() size: 'xs' | 'sm' | 'md' | 'custom';

  constructor(private readonly el: ElementRef) {}

  @HostListener('window:resize')
  onResize(): void {
    this.setHeight(this.el.nativeElement);
  }

  ngAfterViewChecked(): void {
    this.setHeight(this.el.nativeElement);
  }

  setHeight(parent: HTMLElement): void {
    if (!parent) {return;}
    const child = parent.firstElementChild;
    if (!child) {return;}

    parent.style.height = `${child.getBoundingClientRect().height + 24}px`;
  }
}
