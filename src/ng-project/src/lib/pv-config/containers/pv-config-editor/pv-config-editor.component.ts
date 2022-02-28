import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { Project } from '@solargis/types/project';
import {
  getPvConfigTemplateMapWithOrientation, PvConfig, PvConfigParam, PvConfigParamOrder, PvConfigParamType
} from '@solargis/types/pv-config';

import {
  selectSelectedEnergySystem, selectSelectedEnergySystemProject, selectSelectedProjectAppData
} from '../../../project-detail/selectors';
import { mapDatasetData } from '../../../project/utils/map-dataset-data.operator';
import { ClearDraft, Save } from '../../actions/draft.actions';
import { State } from '../../reducers';

@Component({
  selector: 'sg-pv-config-editor',
  templateUrl: './pv-config-editor.component.html',
  styleUrls: ['./pv-config-editor.component.scss']
})
export class PvConfigEditorComponent implements OnInit {
  project: Project;
  sourcePvConfig: PvConfig;
  editedPvConfig: PvConfig;
  isDraft: boolean;

  expanded: {[key: string]: BehaviorSubject<boolean>} = {};
  changed: {[key: string]: boolean} = {};
  isValid: {[key: string]: boolean} = {};

  orderedParamTypes: PvConfigParamType[];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store<State>
  ) {}

  ngOnInit(): void {
    combineLatest(
      this.store.pipe(selectSelectedEnergySystemProject),
      this.store.pipe(selectSelectedEnergySystem),
      this.store.select('pvConfig', 'draft'),
      this.route.queryParams
    ).pipe(
      first()
    ).subscribe(([project, energySystem, draft, query]) => {
      if (query.useDraft && draft) {
        this.sourcePvConfig = draft;
        this.isDraft = true;
      } else if (energySystem && energySystem.pvConfig) {
        this.sourcePvConfig = energySystem.pvConfig;
        this.isDraft = false;
      } else {
        setTimeout(() => {
          this.router.navigate(['prospect', 'detail', project._id, 'pv-configuration']);
        });
        return;
      }

      this.project = project;
      this.orderedParamTypes = PvConfigParamOrder.filter(param => this.sourcePvConfig[param]);
      this.editedPvConfig = { ...this.sourcePvConfig };

      this.orderedParamTypes.forEach(paramType => this.expanded[paramType] = new BehaviorSubject<boolean>(false));
    });
  }

  toggleExpandAll(expand: boolean): void {
    Object.values(this.expanded).forEach(expanded => expanded.next(expand));
  }

  onParamChange(type: PvConfigParamType, param: PvConfigParam): void {
    this.editedPvConfig[type] = param;
    this.changed[type] = this.isChanged(this.sourcePvConfig[type], param);
  }

  isAllInputsValid(): boolean {
    return Object.values(this.isValid).every(Boolean);
  }

  // check if newParams differ from old params
  isChanged(oldParam: PvConfigParam, newParam: PvConfigParam): boolean {
    let result = false;

    Object.keys(oldParam).concat(Object.keys(newParam)).forEach(key => {
      if (Array.isArray(oldParam[key])) {
        result = this.isChanged(oldParam[key], newParam[key]);
      } else if (oldParam[key] !== newParam[key]) {result = true;}
    });

    return result;
  }

  // used for caching panels in accordion
  trackByIndex(index: number): number {
    return index;
  }

  restoreDefault(): void {
    // FIXME similar code is in pv-config-selector.component
    this.store.pipe(
      selectSelectedProjectAppData,
      mapDatasetData('lta', 'annual'),
      filter(ltaAnnualData => !!ltaAnnualData),
      first()

    ).subscribe(ltaAnnual => {
      const pvConfigTemplatesWithOrientation = getPvConfigTemplateMapWithOrientation(this.project.site.point, ltaAnnual.OPTA);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { access, ...pvConfigWithoutAccess } = pvConfigTemplatesWithOrientation[this.sourcePvConfig.type];
      this.editedPvConfig = pvConfigWithoutAccess;

      this.orderedParamTypes.forEach(type => {
        this.changed[type] = this.isChanged(this.sourcePvConfig[type], this.editedPvConfig[type]);
      });
    });
  }

  save(): void {
    this.store.dispatch(new Save(this.editedPvConfig));
    this.back();
  }

  ignore(): void {
    this.store.dispatch(new ClearDraft());
    this.back();
  }

  back(): void {
    this.router.navigate(['..', 'pv-configuration'], {relativeTo: this.route.parent});
  }
}
