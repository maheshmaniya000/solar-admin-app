import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { GeocoderService } from '@solargis/ng-geosearch';
import { ProjectCoverData, projectCoverDataFromUrlParams, ProjectCoverUrlParams } from '@solargis/types/project';
import { Placemark } from '@solargis/types/site';
import { latlngToggle } from '@solargis/units';

import { availableLanguages } from 'ng-shared/core/models';

@Component({
  templateUrl: './prospect-cover.component.html',
  styleUrls: ['./prospect-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProspectCoverComponent implements OnInit {
  today = new Date();
  latlngToggle = latlngToggle;
  projectCover$: Observable<ProjectCoverData>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transloco: TranslocoService,
    private readonly geocoder: GeocoderService
  ) {}

  ngOnInit(): void {
    this.projectCover$ = this.route.queryParams.pipe(
      filter(params => params.s && params.name),
      tap(params => {
        // init lang from URL
        const lang = params.lang;
        const availableLang = !!availableLanguages.find(l => l.lang === lang);
        this.transloco.setActiveLang(availableLang ? lang : 'en');
      }),
      map(params => params as ProjectCoverUrlParams),
      map(params => ({ ...projectCoverDataFromUrlParams(params) })),
      switchMap((project: ProjectCoverData) => {
        if (project.country) {
          return this.geocoder.search(project.point).pipe(
            map(sites => sites[0].place.placemark),
            map((placemark: Placemark) => ({ ...project, country: { ...project.country, name: placemark.countryName } })),
            startWith(project)
          );
        }
        return of(project);
      })
    );
  }
}
