import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChange,
  ViewEncapsulation
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import { Marker } from 'leaflet';
import 'leaflet-draw';
import 'leaflet-fullscreen';
import { GestureHandling } from 'leaflet-gesture-handling';
import { isEqual } from 'lodash-es';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, withLatestFrom } from 'rxjs/operators';

import { createMapLayer } from '@solargis/leaflet-utils';
import { getAlternativeLayerId, hasLabelsAlternative, isLabelsImplicit, MapLayerDef } from '@solargis/types/map';
import { Project, ProjectId } from '@solargis/types/project';
import { centerFromUrlParam, latlngEquals, LatLngZoom, Site } from '@solargis/types/site';
import { diffArrays } from '@solargis/types/utils';

import { sitesToLatLngBounds } from 'ng-project/map/utils/leaflet-utils';
import { SearchClearHighlight, SearchHighlight } from 'ng-project/project-list/actions/search.actions';
import { SearchResultsIconComponent } from 'ng-project/project-list/components/search-results/search-results-icon.component';
import { SearchState } from 'ng-project/project-list/reducers/search.reducer';
import { selectProjectIds } from 'ng-project/project-list/selectors/project-list.selector';
import { SiteFromMap, SiteFromSearch } from 'ng-project/project/actions/site.actions';
import { ProspectAppConfig } from 'ng-shared/config';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { selectRouteData } from 'ng-shared/core/selectors/route-data.selector';
import { simpleChange } from 'ng-shared/utils/rxjs/simplechange.operator';

import { MapCenterMoveEnd } from '../map.actions';
import { MapDrawMode, State } from '../map.reducer';
import { selectMapLayersWithAccess } from '../selectors';
import { customIcon } from '../utils/custom-icon';
import { getDrawProps, midPointMarkers } from '../utils/map-draw-utils';
import { MapLinePopupComponent } from './map-line-popup/map-line-popup.component';
import { MAP_LEGEND_BREAKPOINT } from './map.breakpoint';
import { ProjectMarkerComponent } from './project-marker/project-marker.component';

const geolocationDefaultZoom = 8;
const defaultIcon = new L.DivIcon({
  iconSize: new L.Point(14, 14),
  className: 'leaflet-div-icon leaflet-editing-icon'
});
const tooltipOptions: L.TooltipOptions = {
  permanent: true,
  interactive: true,
  opacity: 1,
  className: 'map-leaflet-tooltip',
  direction: 'center'
};
const tooltipOptionsPolygon: L.TooltipOptions = {
  permanent: true,
  interactive: true,
  opacity: 1,
  className: 'map-leaflet-tooltip map-leaflet-tooltip--polygon',
  direction: 'center'
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[map]',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./map.component.scss'],
  template: ''
})
export class MapComponent implements OnInit, OnDestroy {
  map: L.Map; // public for controls

  private positionAccuracyCircle: L.Circle;

  // update flags to prevent duplicate events, not very nice but haven't find better solution yet
  private mapCenterUpdating = false;

  private readonly center$: Observable<LatLngZoom>;
  private readonly projectMarkers$: Observable<ProjectId[]>;
  private readonly searchResults$: Observable<Site[]>;
  private readonly searchHighlightIndex$: Observable<number>;
  private readonly drawMode$: Observable<MapDrawMode>;

  private markersMap: { [id: string]: L.Marker } = {};
  private searchMarkersGroup: L.LayerGroup;

  // Layers
  private mapLayers: { [id: string]: L.TileLayer } = {};
  private drawLayerGroup: L.LayerGroup = new L.LayerGroup();
  private distanceLayerGroup: L.LayerGroup = new L.LayerGroup();

  // Handlers
  private drawHandler: L.Handler;
  private distanceHandler: L.Handler;

  private readonly subscriptions = new Array<Subscription>();

  constructor(
    private readonly el: ElementRef,
    private readonly store: Store<State>,
    private readonly resolver: ComponentFactoryResolver,
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly config: ProspectAppConfig,
    private readonly renderer: Renderer2
  ) {
    this.center$ = store.select('map', 'center').pipe(
      map(center => center || centerFromUrlParam(this.config.map.center))
    );

    this.projectMarkers$ = this.store.pipe(selectProjectIds);

    const search$ = store.select('projectList', 'search');

    this.searchResults$ = search$.pipe(
      map((search: SearchState) => (search ? search.results : undefined)),
      distinctUntilChanged()
    );

    this.searchHighlightIndex$ = search$.pipe(
      map((search: SearchState) => search ? search.highlightIndex : undefined),
      distinctUntilChanged()
    );

    this.drawMode$ = store.select('map', 'drawMode');
  }

  ngOnInit(): void {
    L.Icon.Default.imagePath = 'images/';
    (L.Map as any).addInitHook('addHandler', 'gestureHandling', GestureHandling);

    this.map = L.map(this.el.nativeElement, {
      fullscreenControl: false,
      worldCopyJump: true,
      minZoom: 2,
      doubleClickZoom: false
    } as L.MapOptions);

    L.control.scale().addTo(this.map);

    this.center$
      .pipe(
        filter(x => !!x),
        first()
      )
      .subscribe(() => {
        this.initMapLayers();
        this.initMapEvents();
        this.initMapView();
        this.initSearchResults();

        // ngOnInit doesn't work
        this.map.invalidateSize(false);

        // initialize child component only after parent is initialized
        setTimeout(() => {
          this.initProjectMarkers();
          this.initDrawing();
          this.mapDraggingOnMobile();
        });
      });

    // invalidate map size on drawer toggle
    const mapDetachRoute$ = this.store.pipe(
      selectRouteData,
      filter(data => data.detachKey === 'prospect-map')
    );
    const layoutDrawerToggle$ = this.store.select('layout').pipe(
      map(layout => layout.drawer.toggle),
      distinctUntilChanged()
    );

    this.subscriptions.push(
      combineLatest([mapDetachRoute$, layoutDrawerToggle$]).pipe(debounceTime(100))
        .subscribe(() => this.map.invalidateSize(false))
    );
  }

  createProjectMarkerIcon(projectId: ProjectId): ComponentRef<ProjectMarkerComponent> {
    // resolve inputs: http://blog.rangle.io/dynamically-creating-components-with-angular-2/
    const inputProviders = [
      { provide: 'projectId', useValue: projectId } // TODO use InjectionToken
    ];
    const injector = Injector.create({ providers: inputProviders, parent: this.injector });

    const compFactory = this.resolver.resolveComponentFactory(ProjectMarkerComponent);
    const projectMarkerIcon: ComponentRef<ProjectMarkerComponent> = compFactory.create(injector);

    this.appRef.attachView(projectMarkerIcon.hostView);
    projectMarkerIcon.instance.onDestroyCallback = () => {
      this.appRef.detachView(projectMarkerIcon.hostView);
    };

    return projectMarkerIcon;
  }

  createSearchIcon(index: number): ComponentRef<SearchResultsIconComponent> {
    const compFactory = this.resolver.resolveComponentFactory(SearchResultsIconComponent);
    const marker = compFactory.create(this.injector);

    marker.instance.index = index;

    this.appRef.attachView(marker.hostView);
    marker.instance.onDestroyCallback = () => {
      this.appRef.detachView(marker.hostView);
    };
    return marker;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.mapDraggingOnMobile();
  }

  private initMapLayers(): void {
    const layerDefs$ = this.store.pipe(
      selectMapLayersWithAccess,
      map((layers: MapLayerDef[]) =>
        layers.reduce((res, layer) => {
          res[layer.labels === true ? 'labels' : layer._id] = layer;
          return res;
        }, {})
      )
    );

    // handle map layer and labels
    this.subscriptions.push(
      combineLatest([
        this.store.select('map', 'selected').pipe(
          filter(sel => !!sel),
          distinctUntilChanged((sel1, sel2) => isEqual(sel1, sel2)),
          simpleChange()
        ),
        layerDefs$
      ]).subscribe(
        ([selectedChange, layerDefs]: [SimpleChange, MapLayerDef[] & { labels: any }]) => {
          const { previousValue: prevSelected, currentValue: nextSelected } = selectedChange;
          const { labels: nextLabels, layerId: nextLayerId } = nextSelected;
          const mapLabels = this.ensureMapLayer(layerDefs.labels);

          if (prevSelected) {
            const { labels: prevLabels, layerId: prevLayerId } = prevSelected;
            const prevLayerDef = layerDefs[prevLayerId];
            const prevLayer = this.ensureMapLayer(prevLayerDef, prevLabels);
            const prevLabelsImplicit = isLabelsImplicit(prevLayerDef);

            // handle previous base map
            if ((prevLayerId !== nextLayerId || prevLabelsImplicit) && this.map.hasLayer(prevLayer)) {
              this.map.removeLayer(prevLayer);
            }
          }

          const nextLayerDef = layerDefs[nextLayerId];
          const nextLabelsImplicit = isLabelsImplicit(nextLayerDef);

          // handle base map
          const nextMapLayer = this.ensureMapLayer(nextLayerDef, nextLabels);

          if (!this.map.hasLayer(nextMapLayer)) {
            this.map.addLayer(nextMapLayer);
          }

          // handle labels
          if ((nextLabelsImplicit || !nextLabels) && this.map.hasLayer(mapLabels)) {
            this.map.removeLayer(mapLabels);
          }
          if (!nextLabelsImplicit && nextLabels && !this.map.hasLayer(mapLabels)) {
            this.map.addLayer(mapLabels);
          }
        }
      )
    );
  }

  private initMapEvents(): void {
    this.map.on('moveend', () => {
      // console.error('*** map moveend ***', this.mapCenterUpdating)
      if (!this.mapCenterUpdating) {
        const center = this.getMapCenter();
        this.store.dispatch(new MapCenterMoveEnd(center));
      }
      this.mapCenterUpdating = false;
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.drawMode$.pipe(first()).subscribe(drawMode => {
        if (drawMode === 'site') {
          const { lat, lng } = e.latlng.wrap();
          this.store.dispatch(new SiteFromMap({ lat, lng }));
        }
        if (drawMode === 'distance') {
          this.distanceHandler.enable();
        }
      });

      this.store
        .select('map', 'selected')
        .pipe(first())
        .subscribe(selected => {
          this.store.dispatch(new AmplitudeTrackEvent('map_click', { mapLayer: selected?.layerId }));
        });
    });

    this.map.on(L.Draw.Event.DRAWSTART, (e: any) => {
      if (e && e.layerType && e.layerType !== 'polyline') {
        this.hideAllProjectMarkers();
        this.clearDrawLayerGroup();
        this.clearDistanceLayerGroup();
        this.map.addLayer(this.drawLayerGroup);
      }
    });

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      this.drawMode$.pipe(first()).subscribe(drawMode => {
        // RECTANGLE || POLYGON
        if (drawMode === 'rectangle' || drawMode === 'polygon') {
          const { edges, polygonArea, circuit } = getDrawProps(e.layer.getLatLngs()[0]);

          // add tooltip using midpoint "fake" marker
          if (drawMode === 'rectangle') {
            this.drawLayerGroup.addLayer(e.layer.bindTooltip(polygonArea, tooltipOptions));
            this.addMidPointMarkers(edges, drawMode);
          }
          if (drawMode === 'polygon') {
            this.drawLayerGroup.addLayer(e.layer.bindTooltip(`${polygonArea}, ${circuit}`, tooltipOptions));
          }

          // enable editing
          if (drawMode === 'rectangle') {
            e.layer.editing = new L.Edit.Rectangle(e.layer, { resizeIcon: defaultIcon, moveIcon: defaultIcon });
          }
          if (drawMode === 'polygon') {
            e.layer.editing = new L.Edit.Poly(e.layer);
          }
          e.layer.editing.enable();
        }

        // DISTANCE
        if (drawMode === 'distance') {
          // enable editing
          e.layer.editing = new L.Edit.Poly(e.layer);
          e.layer.editing.enable();

          // create popup
          const popup = this.linePopup(e.layer);
          this.distanceLayerGroup.addLayer(e.layer.bindPopup(popup));
          this.map.addLayer(this.distanceLayerGroup);

          // Open all popups
          this.distanceLayerGroup.eachLayer(l => l.openPopup(null));
        }
      });
    });

    this.map.on(L.Draw.Event.EDITRESIZE, (e: any) => { // Edit rectangle
      this.drawLayerGroup.eachLayer(l => { // remove all edge midpoint layers
        if (l !== e.layer) {
          this.drawLayerGroup.removeLayer(l);
        }
      });
      // eslint-disable-next-line no-underscore-dangle
      const { edges, polygonArea } = getDrawProps(e.layer._latlngs[0]);
      this.addMidPointMarkers(edges);
      e.layer.unbindTooltip().bindTooltip(polygonArea, tooltipOptions);
    });

    this.map.on('dblclick', () => {
        // close polygon and rectangle on dbl click
      this.drawMode$.pipe(first()).subscribe(drawMode => {
        if (
          this.drawHandler &&
          ((this.drawHandler as any).type === 'polygon' || (this.drawHandler as any).type === 'rectangle') &&
          drawMode !== 'distance'
        ) {
          this.hideAllProjectMarkers();
          this.clearDrawLayerGroup();
          this.clearDistanceLayerGroup();
          this.map.addLayer(this.drawLayerGroup);
          this.drawHandler.enable();
        } else if (this.distanceHandler && drawMode === 'distance') {
          this.hideAllProjectMarkers();
          this.clearDrawLayerGroup();
          this.map.addLayer(this.distanceLayerGroup);
          this.distanceHandler.enable();
        }
      });
    });

    this.map.on(L.Draw.Event.EDITVERTEX, (e: any) => {
      let vertices = e.poly.getLatLngs();

      if (vertices.length === 1) { // POLYGON
        vertices = vertices[0];

        const { polygonArea, circuit } = getDrawProps(vertices);
        let index = 0;
        this.drawLayerGroup.eachLayer(l => { // remove all edge midpoint layers
          if (index > 0) {
            this.drawLayerGroup.removeLayer(l);
          } else {
            l.unbindTooltip().bindTooltip(`${polygonArea}, ${circuit}`, tooltipOptions);
          }
          index++;
        });
      } else {
        this.distanceLayerGroup.eachLayer(l => l.closePopup());

        // Refresh line popup
        const popup = this.linePopup(e.poly);
        e.poly.unbindPopup().bindPopup(popup);

        // Open all popups
        this.distanceLayerGroup.eachLayer(l => l.openPopup(null));
      }
    });

    this.map.on('fullscreenchange', () => {
      if ((this.map as any).isFullscreen()) {
        this.store.dispatch(
          new AmplitudeTrackEvent('map_tool_use', { actionName: 'fullscreen' })
        );
      }
    });
  }

  // update map view according to center update ('default' or 'url')
  private initMapView(): void {
    this.subscriptions.push(
      this.center$
        .pipe(
          distinctUntilChanged((c1, c2) => latlngEquals(c1, c2)),
          filter(c => !latlngEquals(c, this.getMapCenter()))
        )
        .subscribe(center => {
          this.mapCenterUpdating = true;
          this.map.setView(center, center.zoom); // ngrx effect
        })
    );
  }

  private initProjectMarkers(): void {
    const projectList$ = this.store.select('project', 'projects');
    this.subscriptions.push(
      combineLatest([
        this.projectMarkers$.pipe(
          simpleChange(),
          map((markersChange: SimpleChange) => diffArrays(markersChange.previousValue, markersChange.currentValue)),
          withLatestFrom(projectList$, ({ removed, added }, list) => ({ removed, added, list }))
        ),
        this.drawMode$
      ]).subscribe(([projectMarkers, drawMode]: [any, MapDrawMode]) => {
        if (drawMode === 'site') {
          this.hidePositionAccuracyCircle();
          this.removeProjectMarkers(projectMarkers.removed);
          this.addProjectMarkers(
            projectMarkers.added.map(id => projectMarkers.list.get(id)).filter(x => !!x)
          );
        }
      })
    );
  }

  private removeProjectMarkers(removed: ProjectId[]): void {
    removed
      .map(id => ({ id, marker: this.markersMap[id] }))
      .filter(({ marker }) => marker && this.map.hasLayer(marker))
      .forEach(({ id, marker }) => {
        this.map.removeLayer(marker);
        delete this.markersMap[id];
      });
  }

  private showAllProjectMarkers(): void {
    Object.keys(this.markersMap)
      .map(id => this.markersMap[id])
      .filter(marker => marker)
      .forEach(marker => {
        // eslint-disable-next-line no-underscore-dangle
        this.renderer.removeClass((marker as any)._icon as L.Icon, 'hidden');
      });
  }

  private hideAllProjectMarkers(): void {
    Object.keys(this.markersMap)
      .map(id => this.markersMap[id])
      .filter(marker => marker && this.map.hasLayer(marker))
      .forEach(marker => {
        // eslint-disable-next-line no-underscore-dangle
        this.renderer.addClass((marker as any)._icon as L.Icon, 'hidden');
      });
  }

  private addProjectMarkers(projects: Project[]): void {
    projects.forEach(project => {
      const marker = this.showProjectMarker(project);
      this.markersMap[project._id] = marker;

      const from = project.site.from;

      if (!project.created) { // not saved
        if (from === 'search') {this.ensureProjectMarkerInView(project);}
        if (from === 'geolocation') {
          this.showPositionAccuracyCircle(project.site.position);
          this.ensureGeolocatedProjectInView(project);
        }
        if (from === 'iplocation') {
          this.ensureIPlocatedProjectInView(project);
        }
      }
    });
  }

  private initSearchResults(): void {
    // handle search results
    this.subscriptions.push(
      this.searchResults$.subscribe((results: Site[]) => {
        // clear existing
        if (this.searchMarkersGroup) {
          this.map.removeLayer(this.searchMarkersGroup);
          this.searchMarkersGroup.clearLayers();
          this.searchMarkersGroup = undefined;
        }

        // add new
        if (results && results.length) {
          // collect markers
          const searchMarkers = results.map((site: Site, index: number) => {
            const component = this.createSearchIcon(index);
            const nativeElement = component.location.nativeElement;
            const searchIcon = new customIcon({ nativeElement });
            const searchMarker = L.marker(site.point, {
              draggable: false,
              icon: searchIcon,
              zIndexOffset: 600 - index // reverse zIndex so items with lower index are prefered
            });
            searchMarker.on('click', () => {
              this.store.dispatch(new SiteFromSearch(site));
            });
            searchMarker.on('mouseover', () => {
              this.store.dispatch(new SearchHighlight(index));
            });
            searchMarker.on('mouseout', () => {
              this.store.dispatch(new SearchClearHighlight());
            });
            searchMarker.on('remove', () => {
              component.destroy();
            });

            return searchMarker;
          });

          // compute map bounds
          const searchBounds = sitesToLatLngBounds(results);
          this.searchMarkersGroup = L.layerGroup(searchMarkers);

          this.map.addLayer(this.searchMarkersGroup);
          this.map.fitBounds(searchBounds);
        }
      })
    );

    // handle result highlight
    this.subscriptions.push(
      this.searchHighlightIndex$.pipe(simpleChange()).subscribe(indexChange => {
        if (!this.searchMarkersGroup) {return;}

        const { currentValue: index, previousValue: prevIndex } = indexChange;

        // set marker highlight
        if (typeof index !== 'undefined') {
          const marker = this.searchMarkersGroup.getLayers()[index] as L.Marker;
          if (marker) {marker.setZIndexOffset(marker.options.zIndexOffset + 1000);}
        }

        // clear highlight
        if (typeof prevIndex !== 'undefined') {
          const marker = this.searchMarkersGroup.getLayers()[prevIndex] as L.Marker;
          if (marker) {marker.setZIndexOffset(marker.options.zIndexOffset - 1000);}
        }
      })
    );
  }

  private getMapCenter(): LatLngZoom {
    try {
      const { lat, lng } = this.map.getCenter().wrap();
      const zoom = this.map.getZoom();
      return { lat, lng, zoom };
    } catch (e) {
      return null;
    }
  }

  private showProjectMarker(project: Project): L.Marker {
    const zIndexOffset = 100;
    const projectMarker: Marker & { draggingInProgress?: boolean } = L.marker(project.site.point, { draggable: false, zIndexOffset });
    const icon = this.createProjectMarkerIcon(project._id);
    let subscriptions: Subscription[];

    projectMarker.setIcon(new customIcon({ nativeElement: icon.location.nativeElement }));
    projectMarker.addTo(this.map);

    // init dragging
    projectMarker.on('dragstart', () => {
      projectMarker.draggingInProgress = true;
    });
    projectMarker.on('dragend', () => {
      projectMarker.draggingInProgress = false;
      projectMarker.fire('change');
    });
    projectMarker.on('move', () => {
      if (!projectMarker.draggingInProgress) {projectMarker.fire('change');}
    });
    projectMarker.on('change', () => {
      const { lat, lng } = projectMarker.getLatLng().wrap();
      this.store.dispatch(new SiteFromMap({ lat, lng }));
    });
    projectMarker.on('remove', () => {
      if (subscriptions) {subscriptions.forEach(sub => sub.unsubscribe());}
    });

    setTimeout(() => { // map doesn't load without setTimeout here
      subscriptions = [];
      subscriptions.push(
        icon.instance.saved$.subscribe(saved => {
          if (projectMarker.dragging) {
            if (saved) {projectMarker.dragging.disable();}
            else {projectMarker.dragging.enable();}
          }
        })
      );
      const isHighlighted$ = this.store
        .select('projectList', 'highlight')
        .pipe(map(highlightedProject => highlightedProject === project._id));

      subscriptions.push(
        combineLatest(icon.instance.selected$, isHighlighted$).subscribe(
          ([selected, mouseover]) => {
            let currentzIndex = zIndexOffset;
            currentzIndex += selected ? 100 : 0;
            currentzIndex += mouseover ? 1000 : 0;
            if (projectMarker) {projectMarker.setZIndexOffset(currentzIndex);}
          }
        )
      );
    });
    return projectMarker;
  }

  private ensureProjectMarkerInView(project: Project): void {
    const place = project.site.place;
    if (place && place.mapView) {
      const mapView = place.mapView;
      const mapViewBounds = L.latLngBounds(
        mapView.southWest,
        mapView.northEast
      );
      this.map.fitBounds(mapViewBounds, {
        maxZoom: 19 /* TODO max of current layer*/
      });
    } else {
      const latLng = L.latLng(project.site.point);
      if (!this.map.getBounds().contains(latLng)) {
        this.map.setView(latLng, this.map.getZoom());
      }
    }
  }

  private ensureGeolocatedProjectInView(project: Project): void {
    const latlng = L.latLng(project.site.point);
    const zoom =
      this.map.getZoom() < geolocationDefaultZoom
        ? geolocationDefaultZoom
        : this.map.getZoom();

    this.map.setView(latlng, zoom);
  }

  private ensureIPlocatedProjectInView(project: Project): void {
    const center = this.map.getCenter();
    const { lng } = project.site.point;
    const latlng = L.latLng({ lat: center.lat, lng });
    if (this.map.getBounds().contains(latlng)) {
      this.map.setView(latlng, this.map.getZoom());
    }
  }

  private showPositionAccuracyCircle(pos: GeolocationPosition): void {
    if (pos.coords) {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      this.positionAccuracyCircle = L.circle({ lat, lng }, accuracy).addTo(
        this.map
      );
    }
  }

  private hidePositionAccuracyCircle(): void {
    if (this.positionAccuracyCircle) {
      this.map.removeLayer(this.positionAccuracyCircle);
      this.positionAccuracyCircle = undefined;
    }
  }

  private ensureMapLayer(layerDef: MapLayerDef, labels?: boolean): L.TileLayer {
    if (!this.mapLayers[layerDef._id]) {
      const [layer, altLayer] = createMapLayer(layerDef);
      this.mapLayers[layerDef._id] = layer;
      if (altLayer) {
        this.mapLayers[getAlternativeLayerId(layerDef)] = altLayer;
      }
    }
    const layerId = labels && hasLabelsAlternative(layerDef)
      ? getAlternativeLayerId(layerDef) : layerDef._id;

    return this.mapLayers[layerId];
  }

  private initDrawing(): void {
    this.subscriptions.push(
      this.drawMode$.subscribe(drawMode => {
        switch (drawMode) {
          case 'site':
            // depends on order !!!
            this.disableHandlers();
            this.clearDistanceLayerGroup();
            this.clearDrawLayerGroup();
            this.showAllProjectMarkers();
            break;
          case 'rectangle':
            this.disableHandlers();
            this.drawHandler = new L.Draw.Rectangle(this.map, { shapeOptions: { color: '#ffffff', weight: 2 } });
            this.drawHandler.enable();
            break;
          case 'polygon':
            this.disableHandlers();
            this.drawHandler = new L.Draw.Polygon(this.map,
              { shapeOptions: { color: '#ffffff', weight: 2 }, maxPoints: 40, icon: defaultIcon });
            this.drawHandler.enable();
            break;
          case 'distance':
            this.disableHandlers();
            this.distanceHandler = new L.Draw.Polyline(this.map,
              { shapeOptions: { color: '#ffffff', weight: 4, opacity: 1 }, maxPoints: 2, icon: defaultIcon });
            this.distanceHandler.enable();
            break;
          default:
            break;
        }
      })
    );
  }

  private clearDrawLayerGroup(): void {
    if (this.drawLayerGroup && this.map.hasLayer(this.drawLayerGroup)) {
      this.drawLayerGroup.clearLayers();
      this.drawLayerGroup = new L.LayerGroup();
    }
  }

  private clearDistanceLayerGroup(): void {
    if (this.distanceLayerGroup && this.map.hasLayer(this.distanceLayerGroup)) {
      this.distanceLayerGroup.clearLayers();
      this.distanceLayerGroup = new L.LayerGroup();
    }
  }

  private disableHandlers(): void {
    if (this.drawHandler) {
      this.drawHandler.disable();
    }
    if (this.distanceHandler) {
      this.distanceHandler.disable();
    }
  }

  private addMidPointMarkers(edges: any[], mode: string = null): void {
    const markers = midPointMarkers(edges, mode && mode === 'polygon' ? tooltipOptionsPolygon : tooltipOptions);
    markers.forEach(marker => {
      marker.addTo(this.drawLayerGroup);
    });
  }

  private linePopup(obj: any): L.Popup {
    const compFactory = this.resolver.resolveComponentFactory(MapLinePopupComponent);
    const compRef = compFactory.create(this.injector);

    compRef.instance.layer = obj;
    // Line - delete
    compRef.instance.deleteLine.subscribe(l => {
      if (this.distanceLayerGroup.hasLayer(l)) {
        this.distanceLayerGroup.removeLayer(l);
      }
    });
    // Line - change color
    compRef.instance.changeColor.subscribe((res: { id: number; color: string }) => {
      // eslint-disable-next-line no-underscore-dangle
      (this.distanceLayerGroup as any)._layers[res.id].setStyle({ color: res.color });
    });

    this.appRef.attachView(compRef.hostView);
    compRef.onDestroy(() => {
      this.appRef.detachView(compRef.hostView);
    });
    const popupContainer = document.createElement('div');
    popupContainer.appendChild(compRef.location.nativeElement);

    // Create popup
    return new L.Popup({ autoClose: false, closeButton: false, closeOnClick: false, className: 'map-leaflet-popup' })
      .setContent(popupContainer);
  }

  private mapDraggingOnMobile(): void {
    if (window.innerWidth < MAP_LEGEND_BREAKPOINT) {
      // 960 is fxFlex sm breakpoint
      (this.map as any).gestureHandling.enable();
    } else {
      (this.map as any).gestureHandling.disable();
    }
  }
}
