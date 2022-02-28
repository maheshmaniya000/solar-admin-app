import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, first, map, switchMap, tap } from 'rxjs/operators';

import { EnergySystem, EnergySystemRef, hasPvConfig, Project, Report, reportCreationFinished } from '@solargis/types/project';

import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemProject,
  selectSelectedEnergySystemRef
} from 'ng-project/project-detail/selectors';
import { ensureProjectHasLatestData } from 'ng-project/project/decorators/ensure-project-has-latest-data.decorator';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { availableLanguages } from 'ng-shared/core/models';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { downloadBinaryFile } from 'ng-shared/shared/utils/download.utils';

import { ReportsService } from '../../services/reports.service';
import { getReportFileName, mimeTypeByReportType } from '../../utils/report.utils';

@Component({
  selector: 'sg-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent extends SubscriptionAutoCloseComponent implements OnInit {

  reportTypes = ['PDF', 'XLSX'];

  availableLanguages = availableLanguages.filter(lang => lang.inReport);
  languageMap = availableLanguages.reduce((acc, cur) => { acc[cur.lang] = cur.name; return acc; }, {});

  reportEnergySystemRef$: Observable<EnergySystemRef>;
  hasPvConfig$: Observable<boolean>;

  form: FormGroup;

  project: Project;
  projectName: string;

  reports$ = new BehaviorSubject<Report[] | boolean>(false);
  tableColumns = ['name', 'fileType', 'lang', 'economy', 'date', 'download', 'delete'];
  generateButtonDisabled = false;

  getReportFileName = getReportFileName;

  constructor(
    private readonly fb: FormBuilder,
    public store: Store<State>,
    private readonly reportsService: ReportsService,
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      type: [ this.reportTypes[0], [ Validators.required ]],
      lang: [ 'en', [ Validators.required ]],
      economy: [ null, [] ]
    });

    this.hasPvConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => hasPvConfig(system as EnergySystem))
    );

    /**
     * Handle not set PV system and selected noPvSystem the same way
     */
    this.reportEnergySystemRef$ = combineLatest([
      this.store.pipe(selectSelectedEnergySystemRef),
      this.hasPvConfig$
    ]).pipe(
      map(([systemRef, hasPv]) => {
        const ref = { ...systemRef };
        if (!systemRef.systemId || !hasPv) {ref.systemId = 'none';}
        return ref;
      })
    );

    this.addSubscription(
      this.store.pipe(selectSelectedEnergySystemProject).subscribe(
        project => {
          this.project = project;
          this.projectName = this.projectNamePipe.transform(project, null);
        }
      )
    );

    /**
     * If reports are still generating, add polling
     * Using debounce time so multiple emits get merged together
     */
    const timeout = 5000;
    this.addSubscription(
      this.reports$
        .pipe(debounceTime(timeout))
        .subscribe((reports: Report[]) => {
          if (reports && reports.some(report => !reportCreationFinished(report.status))) {
            this.refresh();
          }
        })
    );

    this.refresh();
  }

  getStatus(r: Report): 'GENERATING' | 'FAILED' | 'READY' {
    if (!r || !r.status) {return 'GENERATING';}
    if (r.status.indexOf('READY') > -1) {return 'READY';}
    if (r.status.indexOf('FAILED') > -1) {return 'FAILED';}
    return 'GENERATING';
  }

  refresh(): void {
    this.reportEnergySystemRef$.pipe(
      first(),
      switchMap(system => this.reportsService.listReports(system)),
      first()
    ).subscribe(
      reports => {
        this.reports$.next(reports);
        this.generateButtonDisabled = false;
      },
      () => {
        this.generateButtonDisabled = false;
        this.reports$.next([]);
        this.failed();
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ensureProjectHasLatestData
  createReport(): void {
    this.generateButtonDisabled = true;
    const { lang, type, economy } = this.form.value;
    this.reportEnergySystemRef$.pipe(
      first(),
      switchMap(energySystem => this.reportsService.createReport(
        energySystem,
        type.toLowerCase(),
        lang,
        economy
      ).pipe(tap(() => this.store.dispatch(
        new AmplitudeTrackEvent('report_create', { report: { type: type.toLowerCase(), lang}})
      ))))
    ).subscribe(() => this.refresh(), () => {
      this.generateButtonDisabled = false;
      this.failed();
    });
  }

  downloadReport(report: Report): void {
    const fileName = getReportFileName(this.projectName, report);
    this.reportsService.downloadReport(report, fileName).subscribe(
      res => {
        downloadBinaryFile(res, fileName, mimeTypeByReportType[report.type]);
        this.store.dispatch(new AmplitudeTrackEvent('report_download', { report: { type: report.type, lang: report.lang }}));
      },
      () => this.failed()
    );
  }

  deleteReport(report: Report): void {
    this.dialog
      .open(ConfirmationDialogComponent, { data: { text: 'projectDetail.reports.confirmDelete' }})
      .afterClosed()
      .pipe(
        filter(x => !!x),
        switchMap(() => this.reportsService.deleteReport(report).pipe(first())),
      ).subscribe(() => this.refresh());
  }

  failed(): void {
    this.snackBar.open(
      translate('common.error.failed'),
      null,
      { duration: 5000, panelClass: ['snackbarError', 'snackbarTextCenter'] }
    );
  }
}
