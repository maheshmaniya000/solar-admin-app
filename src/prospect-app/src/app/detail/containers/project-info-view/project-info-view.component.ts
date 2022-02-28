import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, map, publishReplay, refCount, startWith, switchMap } from 'rxjs/operators';

import { daylength, DayLengthOptions, sunpath } from '@solargis/sg-charts';
import { getProjectDefaultSystem, Project } from '@solargis/types/project';
import { getProjectAppHorizonRef } from '@solargis/types/site';


import { selectSelectedEnergySystemProject } from 'ng-project/project-detail/selectors';
import { DataLoad } from 'ng-project/project/actions/project-data.actions';
import { Load } from 'ng-project/project/actions/project.actions';
import { ensureProjectHasLatestData } from 'ng-project/project/decorators/ensure-project-has-latest-data.decorator';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { canvasWithFooterToDataURL } from 'ng-project/project/utils/export-chart.utils';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { downloadDataUrl } from 'ng-shared/shared/utils/download.utils';

import { EditHorizonDialogComponent } from '../../components/edit-horizon-dialog/edit-horizon-dialog.component';
import { HorizonService } from '../../services/horizon.service';
import { getDaylengthOptions } from '../../utils/daylength.chart';
import { getSunpathOptions } from '../../utils/sunpath.chart';

@Component({
  selector: 'sg-project-info-view',
  templateUrl: './project-info-view.component.html',
  styleUrls: ['./project-info-view.component.scss']
})
export class ProjectInfoViewComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @ViewChild('sunpath', { static: true }) sunpathCanvas: ElementRef;
  @ViewChild('daylength', { static: true }) daylengthCanvas: ElementRef;

  horizonSpinner = false;

  project$: Observable<Project>;
  horizon$: Observable<[number, number][]>;

  horizonType$: Observable<string>;

  constructor(
    public store: Store<State>,
    private readonly horizonService: HorizonService,
    private readonly transloco: TranslocoService,
    private readonly dialog: MatDialog,
    private readonly projectNamePipe: ProjectNamePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.project$ = this.store.pipe(
      selectSelectedEnergySystemProject,
      filter(x => !!x),
    );

    this.horizon$ = this.project$.pipe(
      distinctUntilChanged(),
      switchMap(project => this.horizonService.getHorizon(project)),
      publishReplay(),
      refCount()
    );

    this.horizonType$ = this.project$.pipe(
      map(project => getProjectAppHorizonRef(project, 'prospect')),
      map(ref => ref ? 'custom' : 'default')
    );

    // it is possible to subscribe for one translation and then use instant on others
    // we need translate.get to signal when translations are loaded
    // lang.change to intercept changes
    // https://stackoverflow.com/questions/46216185/ngx-translate-instant-returns-key-instead-of-value
    // - see FIXME comment
    const onTranslate$ = combineLatest( // TODO remove, this code does nothing
      this.transloco.translate('projectDetail.sunpath.sunpath'),
      this.transloco.langChanges$.pipe(startWith(null))
    ).pipe(map(() => null)); // ???

    this.initSunpath(this.horizon$, onTranslate$);
    this.initDaylength(this.horizon$, onTranslate$);
  }

  initSunpath(horizon$: Observable<any>, onTranslate$: Observable<any>): void {
    // startWith is used to display chart even though some data are still loading
    this.addSubscription(
      combineLatest(
        this.project$,
        horizon$.pipe(startWith(undefined)),
        onTranslate$
      ).subscribe(([project, horizon]) => {
        const canvas = this.sunpathCanvas.nativeElement;
        const options = getSunpathOptions(project, horizon);
        sunpath(canvas, options);
      })
    );
  }

  initDaylength(horizon$: Observable<any>, onTranslate$: Observable<any>): void {
    this.addSubscription(
      combineLatest([
        this.project$,
        horizon$.pipe(startWith(undefined)),
        onTranslate$
      ]).subscribe(([project, horizon]) => {
        const canvas = this.daylengthCanvas.nativeElement;
        const options: DayLengthOptions = getDaylengthOptions(project, horizon);
        daylength(canvas, options);
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ensureProjectHasLatestData
  editHorizon(): void {
    this.horizonSpinner = true;

    combineLatest(this.horizon$, this.project$).pipe(
      first(),
      switchMap(([horizon, project]) => {
        this.horizonSpinner = false;

        return this.dialog
          .open(EditHorizonDialogComponent, { data: { horizon, project } })
          .afterClosed()
          .pipe(map(editedHorizon => [project, editedHorizon]));
      }),
      first(),
      filter(([, horizon]) => !!horizon && horizon.isChanged),
      switchMap(([project, horizon]) => {
        this.horizonSpinner = true;

        if (horizon.isDefault) {
          return this.horizonService.deleteHorizon(project).pipe(map(() => project));
        } else {
          return this.horizonService.updateHorizon(project, horizon.horizon).pipe(map(() => project));
        }
      }),
    ).subscribe(
      ({_id}: Project) => {
        // Reload all data
        this.project$.pipe(first()).subscribe(
          project => {
            const energySystem = getProjectDefaultSystem(project, 'prospect');
            this.store.dispatch(new DataLoad({ app: 'prospect', projectId: project._id }));
            if (energySystem && energySystem.systemId) {
              this.store.dispatch(new DataLoad(energySystem));
            }
          }
        );

        // Reload project (new horizon data there (default, custom))
        this.store.dispatch(new Load(_id));

        // since reloading is async, allow some more time
        setTimeout(() => this.horizonSpinner = false, 4500); // FIXME this is ugly
      }
    );
  }

  exportCanvas(type: 'sunpath' | 'daylength'): void {
    this.project$.pipe(first()).subscribe(project => {
      const obj = type === 'sunpath' ? this.sunpathCanvas : this.daylengthCanvas;
      const name = this.projectNamePipe.transform(project);
      const img = canvasWithFooterToDataURL(obj.nativeElement, [], name, null, null, `projectDetail.${type}.label`);

      downloadDataUrl(img, `Solargis_Chart_${name || 'Export'}_${type}.png`);
    });
  }

}
