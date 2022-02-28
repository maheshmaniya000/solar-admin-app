import { Injectable, OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@ngneat/transloco';
import { Subscription } from 'rxjs';

@Injectable()
export class SgPaginatorIntl extends MatPaginatorIntl implements OnDestroy {

  itemsPerPageLabel = '';
  nextPageLabel     = '';
  previousPageLabel = '';

  private readonly subscription: Subscription;

  constructor(private readonly transloco: TranslocoService) {
    super();

    this.subscription = transloco.selectTranslateObject('common.paginator')
      .subscribe(({ perPage, nextPage, previousPage }) => {
        this.itemsPerPageLabel = perPage;
        this.nextPageLabel = nextPage;
        this.previousPageLabel = previousPage;
      }
    );
  }

  getRangeLabel = (page, pageSize, length): string => {
    if (length === 0 || pageSize === 0) {
      return this.transloco.translate('common.paginator.rangeLabelEmpty');
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize + 1;
    // If the start index exceeds the list length, just use length.
    const endIndex = startIndex < length ?
        Math.min(startIndex - 1 + pageSize, length) :
        length;

    return this.transloco.translate('common.paginator.rangeLabel', {startIndex, endIndex, length});
  };

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
