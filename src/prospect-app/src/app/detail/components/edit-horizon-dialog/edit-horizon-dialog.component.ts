import { Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, publishReplay, refCount } from 'rxjs/operators';

import { LiveSunpathOptions, PositionEvent, sunpath } from '@solargis/sg-charts';
import { Project } from '@solargis/types/project';
import { getProjectAppHorizonRef, Horizon, horizonToPVsystFormat } from '@solargis/types/site';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { downloadDataUrl } from 'ng-shared/shared/utils/download.utils';

import { HorizonService } from '../../services/horizon.service';
import { getSunpathOptions } from '../../utils/sunpath.chart';

function horizonObjectToString(horizon: Horizon): string {
  return horizon.map(x => x.join(':')).join('\n');
}

function horizonStringToObject(horizonStr: string): Horizon {
  return horizonStr
    .split(/\n/g)
    .map(entry => entry.split(':').map(v => parseFloat(v.trim()))) as Horizon;
}

type HorizonUpdateOpts = {
  updateOnly?: 'input' | 'chart';
  fromUndo?: boolean;
  fromRedo?: boolean;
};

interface CursorPosition {
  azimuth: string;
  elevation: string;
  horizon: string;
}

@Component({
  selector: 'sg-edit-horizon-dialog',
  templateUrl: './edit-horizon-dialog.component.html',
  styleUrls: ['./edit-horizon-dialog.component.scss']
})
export class EditHorizonDialogComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @ViewChild('sunpath', { static: true }) sunpathCanvas: ElementRef;
  @ViewChild('input', { static: true }) input: ElementRef;

  onInputChange$ = new EventEmitter<string>();

  positionTranslateOptsSubject$ = new BehaviorSubject<CursorPosition>(null);
  positionTranslateOpts$: Observable<CursorPosition>;

  project: Project;
  options: LiveSunpathOptions<Horizon>;
  horizonStr: string;
  historyStr: string[] = [];
  redoHistoryStr: string[] = [];
  isDefaultHorizon = false;

  constructor(
    public dialogRef: MatDialogRef<EditHorizonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { horizon: Horizon; project: Project },
    public service: HorizonService,
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    private readonly projectName: ProjectNamePipe
  ) {
    super();
    this.project = data.project;
  }

  ngOnInit(): void {
    this.setHorizonFromObject(this.data.horizon, { updateOnly: 'input' });

    const canvas = this.sunpathCanvas.nativeElement;
    const initOpts = getSunpathOptions(this.project, this.data.horizon);

    initOpts.editing = true;

    this.options = sunpath<Horizon>(canvas, initOpts);

    this.positionTranslateOpts$ = this.positionTranslateOptsSubject$.pipe(
      distinctUntilChanged(isEqual),
      publishReplay(),
      refCount()
    );

    // horizon from chart
    this.options.update(() =>
      (this.options.position = (e: PositionEvent<Horizon>) => {
        if (e.changedHorizon) {
          this.setHorizonFromObject(this.options.horizon as Horizon, { updateOnly: 'input' });
          this.isDefaultHorizon = false;
        } else {
          this.positionTranslateOptsSubject$.next(!e.isInsideBox ? null : {
              azimuth: e.azimuth.toIndentString(),
              elevation: e.elevation.toIndentString(),
              horizon: e?.horizon?.toFixed(1)
            }
          );
        }
      })
    );

    // horizon from input
    this.addSubscription(
      this.onInputChange$
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(horizonStr => {
          this.setHorizonFromString(horizonStr, { updateOnly: 'chart' });
          this.isDefaultHorizon = false;
        })
    );
  }

  setHorizonFromObject(horizon: Horizon, opts: HorizonUpdateOpts = {}): void {
    const horizonStr = horizonObjectToString(horizon);
    this.setHorizon(horizon, horizonStr, opts);
  }

  setHorizonFromString(horizonStr: string, opts: HorizonUpdateOpts = {}): void {
    const horizon = horizonStringToObject(horizonStr);
    this.setHorizon(horizon, horizonStr, opts);
  }

  save(): void {
    const isAlreadyDefault = !getProjectAppHorizonRef(this.project, 'prospect');

    this.dialogRef.close({
      horizon: this.options.horizon,
      isDefault: this.isDefaultHorizon,
      isChanged: this.historyStr.length > 0 && !(isAlreadyDefault && this.isDefaultHorizon)
    });
  }

  setDefault(): void {
    this.service
      .getHorizon(this.project, 'default')
      .pipe(first())
      .subscribe(horizon => {
        this.setHorizonFromObject(horizon);
        this.isDefaultHorizon = true;
      });
  }

  exportHorizon(): void {
    const dataUrl = horizonToPVsystFormat(
      this.options.horizon as Horizon,
      this.project.site.point.lat,
      this.project.site.point.lng
    ).toDataUrl();
    downloadDataUrl(dataUrl, this.projectName.transform(this.project) + '-horizon.HOR');
  }

  undo(): void {
    if (this.historyStr.length > 0) {
      const horizon = this.historyStr.pop();
      this.redoHistoryStr.push(this.horizonStr);
      this.setHorizonFromString(horizon, { fromUndo: true });
    }
  }

  redo(): void {
    if (this.redoHistoryStr.length > 0) {
      const horizon = this.redoHistoryStr.pop();
      this.setHorizonFromString(horizon, { fromRedo: true });
    }
  }

  isHorizonValid(): boolean {
    const horizon = horizonStringToObject(this.horizonStr);

    if (!horizon || !horizon.length) {return false;}

    let result = true;

    horizon.forEach(row => {
      if (row.length !== 2 || Number.isNaN(row[0]) || row[0] < 0 || row[0] > 360 || Number.isNaN(row[1]) || row[1] < 0 || row[1] > 90) {
        result = false;
      }
    });

    return result;
  }

  private setHorizon(horizon: Horizon, horizonStr: string, opts: HorizonUpdateOpts = {}): void {
    if (!opts.fromUndo && this.horizonStr) {
      this.historyStr.push(this.horizonStr);
    }

    this.horizonStr = horizonStr;

    if (!opts.updateOnly || opts.updateOnly === 'input') {
      this.input.nativeElement.value = horizonStr;
    }
    if (!opts.updateOnly || opts.updateOnly === 'chart') {
      this.options.update(() => (this.options.horizon = horizon));
    }
    if (!opts.fromRedo && !opts.fromUndo) {
      this.redoHistoryStr = [];
    }
  }
}
