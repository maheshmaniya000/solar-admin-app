import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { ProspectDetailComponent } from '../containers/prospect-detail/prospect-detail.component';


/**
 * Dummy guard
 */
@Injectable()
export class DummyGuard implements CanDeactivate<ProspectDetailComponent> {

  canDeactivate(): boolean {
    return true;
  }
}

