import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subscription } from 'rxjs';

import { TranslationDef, TranslationDefResolved, resolveTranslationDef } from '@solargis/types/translation';

@Component({
  selector: 'sg-translation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="res.translate; else plainString">
      {{ getTranslateKey() | transloco: res.translateParams }}
    </ng-container>
    <ng-template #plainString>{{ res.plainText }}</ng-template>`
})
export class TranslationComponent implements OnChanges, OnInit, OnDestroy {

  @Input() str!: string | TranslationDef;
  @Input() key!: string;

  res!: TranslationDefResolved;
  subscription!: Subscription;

  constructor(private readonly transloco: TranslocoService, private readonly ref: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.res = resolveTranslationDef(this.str, this.key);
  }

  ngOnInit(): void {
    this.subscription = this.transloco.langChanges$.subscribe(
      () => setTimeout(() => this.ref.markForCheck())
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {this.subscription.unsubscribe();}
  }

  getTranslateKey(): string {
    return this.res.translateKey || '';
  }
}
