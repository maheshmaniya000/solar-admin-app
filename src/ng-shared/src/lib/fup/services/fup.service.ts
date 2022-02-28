import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { CaptchaResult } from '@solargis/types/captcha';

import { FupDialogComponent } from '../components/fup-dialog/fup-dialog.component';

/**
 * Service for handling FUP services
 */

@Injectable()
export class FupService {

  constructor(
    public dialog: MatDialog) { }

  /**
   * Open recaptcha dialog, result recaptcha token is available inside result parameter 'recaptchaToken'
   * (e.g.: result.recaptchaToken)
   *
   * @returns
   */
  openFupCheck(): Observable<CaptchaResult> {
    return this.dialog.open(FupDialogComponent).afterClosed();
  }
}
