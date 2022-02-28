import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';

import { Vector2 } from '@solargis/types/pvlib-api';

@Component({ template: '' })
export abstract class AbstractMarkerComponent {
  @HostBinding('class.selected') @Input() selected = false;
  @Output() selectedChange = new EventEmitter<void>();

  constructor(readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('click') onClick(): void {
    this.selectedChange.emit();
  }

  getPivotPoint(): Vector2 {
    const element = this.elementRef.nativeElement;

    return {
      u: element.offsetWidth / 2,
      v: element.offsetHeight
    };
  }
}
