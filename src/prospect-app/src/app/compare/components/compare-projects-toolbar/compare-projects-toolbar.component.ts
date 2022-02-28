import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { hasPvConfig } from '@solargis/types/project';
import { pvInstalledPower } from '@solargis/types/pv-config';
import { installedPowerUnit } from '@solargis/units';

import { ExtendedProject, getProjectMetadataStatus } from 'ng-project/project/reducers/projects.reducer';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { pvConfigDivider } from 'ng-shared/utils/misc';

import { hasEconomyConfig } from '../../utils/energy-system.utils';

@Component({
  selector: 'sg-compare-projects-toolbar',
  templateUrl: './compare-projects-toolbar.component.html',
  styleUrls: ['./compare-projects-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareProjectsToolbarComponent{

  @Input() compare: CompareItem[];
  @Output() remove = new EventEmitter<CompareItem>();
  @Output() updateData = new EventEmitter<CompareItem>();
  @Output() highlight = new EventEmitter<CompareItem>();

  @ViewChild('toolbar', { static: true }) toolbar: ElementRef;

  divider = pvConfigDivider;
  hasPvConfig = hasPvConfig;
  pvInstalledPower = pvInstalledPower;
  installedPowerUnit = installedPowerUnit;

  constructor(private readonly router: Router) { }

  isAddEconConfigButtonVisible(item: CompareItem): boolean {
    return hasPvConfig(item.energySystem) && this.hasLatestData(item.project) && !hasEconomyConfig(item.energySystem);
  }

  hasLatestData(project: ExtendedProject): boolean {
    return getProjectMetadataStatus(project, 'prospect').latest;
  }

  isBottomActionButtonVisible(): boolean {
    return this.compare.some(item => !this.hasLatestData(item.project) || this.isAddEconConfigButtonVisible(item));
  }

  openProject(item: CompareItem): void {
    this.router.navigate(['/detail', item.project._id]);
  }

  redirectToPVSettings(item: CompareItem): void {
    this.router.navigate(['/detail', item.project._id, 'configure']);
  }

  redirectToFinanceSettings(item: CompareItem): void {
    this.router.navigate(['/detail', item.project._id, 'finance']);
  }

  onCloseButtonClick(item: CompareItem, event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(item);
  }

  updateProjectData(item: CompareItem, event: MouseEvent): void {
    event.stopPropagation();
    this.updateData.emit(item);
  }
}
