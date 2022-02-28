import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Subscription, Observable } from 'rxjs';
import { first, map, filter, switchMap } from 'rxjs/operators';

import { EnergySystem, getProjectDefaultSystem, hasPvConfig, Project } from '@solargis/types/project';
import { PvConfig, getPvConfigTemplatesWithOrientation, Orientation, PvConfigTemplate } from '@solargis/types/pv-config';
import { latlngToAzimuth } from '@solargis/types/site';
import { ProspectLicense } from '@solargis/types/user-company';

import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { selectProjectPermissions } from 'ng-shared/user/selectors/permissions.selectors';

import { selectSelectedEnergySystemProject, selectSelectedProjectAppData } from '../../../project-detail/selectors';
import { ProjectNamePipe } from '../../../project/pipes/project-name.pipe';
import { mapDatasetData } from '../../../project/utils/map-dataset-data.operator';
import { Save, SetDraft } from '../../actions/draft.actions';
import { State } from '../../reducers';


@Component({
  selector: 'sg-pv-config-selector',
  templateUrl: './pv-config-selector.component.html',
  styleUrls: ['./pv-config-selector.component.scss']
})
export class PvConfigSelectorComponent implements OnInit {

  defaultPvConfigTemplates: PvConfigTemplate[];
  projectPvConfigTuples: [Project, PvConfig][];
  optimalOrientation$: Observable<Orientation>;

  project: Project;
  selectedPvConfigFromCopy: PvConfig;
  selectedPvConfigFromTemplate: PvConfig;
  selectedPvConfig: PvConfig;

  isEdit: boolean;

  permissions$: Observable<string[]>;
  license$: Observable<ProspectLicense>;

  subscriptions: Subscription[] = [];

  constructor(
    private readonly store: Store<State>,
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectNamePipe: ProjectNamePipe
  ) { }

  ngOnInit(): void {
    this.route.data
      .pipe(first())
      .subscribe(data => this.isEdit = data.edit);

    // set project
    const project$ = this.store.pipe(selectSelectedEnergySystemProject);
    project$.pipe(first())
      .subscribe(project => this.project = project);

    const ltaAnnual$ = this.store.pipe(
      selectSelectedProjectAppData,
      mapDatasetData('lta', 'annual'),
      filter(ltaAnnual => !!ltaAnnual)
    );

    this.permissions$ = project$.pipe(
      switchMap(project => this.store.pipe(selectProjectPermissions(project)))
    );

    this.license$ = this.store.pipe(
      selectActiveOrNoCompany,
      map(c => c && c.prospectLicense),
    );

    // default config templates
    combineLatest(project$, ltaAnnual$).pipe(
      map(([project, ltaAnnual]) => getPvConfigTemplatesWithOrientation(project.site.point, ltaAnnual.OPTA)),
      first()
    ).subscribe(templates => this.defaultPvConfigTemplates = templates);


    this.optimalOrientation$ = combineLatest(project$, ltaAnnual$).pipe(
      map(([project, ltaAnnual]) => ({
        azimuth: latlngToAzimuth(project.site.point),
        tilt: ltaAnnual.OPTA
      })),
      first()
    );

    // templates from project default systems
    this.store.select('project', 'projects').pipe(
      map(projects => projects
        .map(project => {
          const projectName = this.projectNamePipe.transform(project, null);
          const defaultSystem = getProjectDefaultSystem(project, 'prospect');           // getting default system per project only
          return [project, projectName, defaultSystem] as [Project, string, EnergySystem];
        })
        .filter(([, , system]) => hasPvConfig(system))                    // filter projects with valid pvconfig
        .map(([project, projectName, system]) => [project, projectName, system.pvConfig])   // map system to pvconfig
        .sort(([, name1, ], [, name2, ]) => name1 < name2 ? -1 : (name1 === name2 ? 0 : 1)) // sort by project name
        .map(([project, , config]) => [project, config] as [Project, PvConfig])
      ),
      first()
    ).subscribe(tuples => this.projectPvConfigTuples = tuples);
  }

  close(): void {
    if (this.isEdit) {
      this.router.navigate(['..', 'pv-configuration'], { relativeTo: this.route.parent });
    } else {
      this.location.back();
    }
  }

  confirm(): void {
    if (this.isEdit) {
      this.store.dispatch(new SetDraft(this.selectedPvConfig));
      this.router.navigate(['..', 'editor'], { relativeTo: this.route, queryParams: { useDraft: 1 }});
    } else {
      this.store.dispatch(new Save(this.selectedPvConfig));
      this.router.navigate(['..', 'pv-configuration'], { relativeTo: this.route.parent });
    }
  }

  selectPvConfig(pvConfig: PvConfig | PvConfigTemplate, tabIndex: number): void {
    if (tabIndex === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { access, ...pvConfigFields } = pvConfig as PvConfigTemplate;
      this.selectedPvConfigFromTemplate = pvConfigFields;
    } else {
      this.selectedPvConfigFromCopy = pvConfig;
    }
    this.selectedPvConfig = pvConfig;
  }

  tabChange(tabIndex: number): void {
    if (tabIndex === 0) {
      this.selectedPvConfig = this.selectedPvConfigFromTemplate;
    } else {
      this.selectedPvConfig = this.selectedPvConfigFromCopy;
    }
  }
}
