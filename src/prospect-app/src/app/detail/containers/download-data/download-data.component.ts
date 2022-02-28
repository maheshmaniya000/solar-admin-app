import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { translate } from '@ngneat/transloco';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { ProjectPvSystDataCsvService } from '../../services/project-pvsyst-data-csv.service';


@Component({
  selector: 'sg-download-data',
  templateUrl: './download-data.component.html',
  styleUrls: ['./download-data.component.scss']
})
export class DownloadDataComponent extends SubscriptionAutoCloseComponent implements OnInit {
  form: FormGroup;
  generateButtonDisabled = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly csvService: ProjectPvSystDataCsvService
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      lang: [ 'en', [ Validators.required ]]
    });
  }

  exportPvSystData(): void {
    this.generateButtonDisabled = true;
    const { lang } = this.form.value;

    this.csvService.exportPvSystData(lang)
      .subscribe(() => {
        this.generateButtonDisabled = false;
      }, () => {
        this.generateButtonDisabled = false;
        this.failed();
      });
  }

  failed(): void {
    this.snackBar.open(
      translate('common.error.failed'),
      null,
      { duration: 5000, panelClass: ['snackbarError', 'snackbarTextCenter'] }
    );
  }
}
