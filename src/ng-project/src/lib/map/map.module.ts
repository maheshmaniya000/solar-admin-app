import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColorPickerModule } from 'ngx-color-picker';

import { MapCoreModule } from 'ng-project/map/map-core.module';
import { MapLegendService } from 'ng-project/map/services/map-legend.service';
import { ProjectListModule } from 'ng-project/project-list/project-list.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { MapLinePopupComponent } from './components/map-line-popup/map-line-popup.component';
import { MapSelectorDialogComponent } from './components/map-selector-dialog/map-selector-dialog.component';
import { MapSelectorPreviewComponent } from './components/map-selector-dialog/map-selector-preview.component';
import { MapSidebarComponent } from './components/map-sidebar/map-sidebar.component';
import { MapComponent } from './components/map.component';
import { ProjectMarkerComponent } from './components/project-marker/project-marker.component';
import { MapContainerComponent } from './containers/map-container/map-container.component';
import { MapViewComponent } from './containers/map-view.component';
import { MapCoordinatesComponent } from './controls/map-coordinates.component';
import { MapDrawComponent } from './controls/map-draw';
import { MapFullScreenViewComponent } from './controls/map-full-screen-view/map-full-screen-view.component';
import { MapLegendCanvasComponent } from './controls/map-legend-canvas/map-legend-canvas.component';
import { MapLegendComponent } from './controls/map-legend/map-legend.component';
import { MapLocationComponent } from './controls/map-location/map-location.component';
import { MapMenuComponent } from './controls/map-menu/map-menu.component';
import { MapPreviewComponent } from './controls/map-preview/map-preview.component';
import { MapZoomSelectedComponent } from './controls/map-zoom-selected/map-zoom-selected.component';

@NgModule({
  imports: [
    ColorPickerModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatToolbarModule,
    SharedModule,
    MapCoreModule,
    ProjectListModule
  ],
  declarations: [
    MapComponent,
    MapCoordinatesComponent,
    MapFullScreenViewComponent,
    MapLegendCanvasComponent,
    MapLegendComponent,
    MapLocationComponent,
    MapMenuComponent,
    MapPreviewComponent,
    MapSelectorDialogComponent,
    MapSelectorPreviewComponent,
    MapContainerComponent,
    MapSidebarComponent,
    MapViewComponent,
    MapZoomSelectedComponent,
    ProjectMarkerComponent,
    MapDrawComponent,
    MapLinePopupComponent
  ],
  providers: [MapLegendService],
  entryComponents: [MapSelectorDialogComponent, ProjectMarkerComponent, MapLinePopupComponent],
  exports: [MapViewComponent]
})
export class MapModule {
}
