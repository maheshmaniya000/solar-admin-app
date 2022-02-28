import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { AccessRegions, AccessSite, APIAccessType } from '@solargis/types/api/contract';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

/**
 * Component for api contract AccessType (global/region/site).
 */
@Component({
  selector: 'sg-admin-api-access-definition',
  templateUrl: './admin.api-access-definition.component.html',
  styleUrls: [ '../../containers/api-contract/admin.api-contract-container.component.scss', 'admin.single-api-contract.component.scss' ]
})
export class AdminApiAccessDefinitionComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @Input() access: any;

  @Output() accessChange = new EventEmitter<any>();

  accessType: FormGroup;
  get typeForm(): any { return this.accessType.get('type'); }

  regions: AccessRegions[] = [];
  sites: AccessSite[];

  constructor(private readonly fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.accessType = this.fb.group({
      type: [APIAccessType.GLOBAL, [ Validators.required ]],
      maxCountOfSites: [null, [ Validators.min(1) ]]
    });

    if (this.access) { // some access is loaded
      this.accessType.patchValue(this.access);
      // load sites / regions
      if (this.access.type === APIAccessType.SITES) {
        this.sites = this.access.sites;
      }
      if (this.access.type === APIAccessType.REGIONS) {
        this.regions = this.access.regions;
      }
    }

    this.accessType.valueChanges.subscribe(accessType => {
      this.emitForm(accessType);
    });
  }

  changeAccessSites(accessSites: AccessSite[]): void {
    this.sites = accessSites;
    this.emitForm(this.accessType.value);
  }

  changeRegion(region: AccessRegions, $event: MatCheckboxChange): void {
    if (!$event.checked && this.regions.indexOf(region) > -1) {
      this.regions.splice(this.regions.indexOf(region), 1);
    }
    if ($event.checked && this.regions.indexOf(region) === -1) {
      this.regions.push(region);
    }
    this.emitForm(this.accessType.value);
  }

  private emitForm(accessType): void {
    if (!this.isValid()) {
      this.accessChange.emit(null);
      return;
    }

    if (accessType.type === APIAccessType.GLOBAL) {
      this.regions = [];
      this.accessChange.emit({
        type: accessType.type,
        maxCountOfRequest: accessType.maxCountOfRequest,
        maxCountOfSites: accessType.maxCountOfSites
      });
    }
    if (accessType.type === APIAccessType.REGIONS) {
      this.accessChange.emit({
        type: accessType.type,
        maxCountOfRequest: accessType.maxCountOfRequest,
        maxCountOfSites: accessType.maxCountOfSites,
        regions: this.regions
      });
    }
    if (accessType.type === APIAccessType.SITES) {
      this.regions = [];
      this.accessChange.emit({
        type: accessType.type,
        sites: this.sites
      });
    }
  }

  private isValid(): boolean {
    if (this.typeForm.value === APIAccessType.GLOBAL) {
      return this.accessType.valid;
    } else if (this.typeForm.value === APIAccessType.REGIONS) {
      return this.accessType.valid && this.regions.length > 0;
    } else {
      return this.accessType.valid && this.sites != null;
    }
  }
}
