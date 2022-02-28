import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// copy-paste from https://coryrylan.com/blog/creating-a-custom-debounce-click-directive-in-angular
@Directive({
  selector: '[sgDebounceClick]',
})
export class DebounceClickDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 500;
  @Output() debounceClick = new EventEmitter();

  private readonly clicks = new Subject();
  private subscription: Subscription;

  ngOnInit(): void {
    this.subscription = this.clicks
      .pipe(debounceTime(this.debounceTime))
      .subscribe(e => this.debounceClick.emit(e));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}
