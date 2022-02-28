import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AccessSite } from '@solargis/types/api/contract';
import { removeEmpty } from '@solargis/types/utils';

@Component({
  selector: 'sg-admin-api-site-access',
  templateUrl: './admin.api-site-access.component.html',
  styleUrls: [ '../../containers/api-contract/admin.api-contract-container.component.scss', './admin.api-site-access.component.scss' ]
})
export class AdminApiSiteAccessComponent implements OnInit {

  @Input() accessSites: AccessSite[];
  @Output() accessSitesChange = new EventEmitter<AccessSite[]>();

  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      accessSites: this.fb.array([])
    });

    // if sites has bean loaded -> create form and apply data
    if (this.accessSites) {
      if (this.accessSites.length > 0) {
        this.accessSites.forEach(site => this.addNewAccessSite(site));
      } else {
        this.addNewAccessSite();
      }
    } else {
      this.addNewAccessSite();
    }

    this.form.valueChanges.subscribe(form => {
      const accessSites = form.accessSites
        .map(site =>  {
          if (this.isValidDate(site.validFrom)) {
            site.validFrom = site.validFrom.getTime();
          } else {
            delete site.validFrom;
          }
          if (this.isValidDate(site.validTo)) {
            site.validTo = site.validTo.getTime();
          } else {
            delete site.validTo;
          }
          if (site.area && !site.area.radius) {
            delete site.area;
          }
          return site;
        })
        .map(site => removeEmpty(site, true));

      if (this.form.valid && accessSites.length > 0) {
        this.accessSitesChange.emit(accessSites);
      } else {
        this.accessSitesChange.emit(null);
      }
    });
  }

  /**
   * Get list of access sites as (reactive) forms
   */
  getAccessSites(): AbstractControl[] {
    return (this.form.controls.accessSites as FormArray).controls;
  }

  /**
   * Add new site or existing site to form
   *
   * @param accessSite - if present, values of new existing site will be set
   */
  addNewAccessSite(accessSite?: AccessSite): void {
    const accessSites = this.form.controls.accessSites as FormArray;
    accessSites.push(this.createNewAccessSite(accessSite));
  }

  /**
   * Remove existing access site from form
   *
   * @param index
   */
  removeAccessSite(index: number): void {
    const orderItems =  this.form.controls.accessSites as FormArray;
    orderItems.removeAt(index);
  }

  /**
   * Create new Order Item (form group)
   */
  private createNewAccessSite(accessSite?: AccessSite): FormGroup {
    const newAccessSite = this.fb.group({
      latitude: [undefined, Validators.required],
      longitude: [undefined, [Validators.required]],

      area: this.fb.group({
        radius: [undefined, [ ]]
      }),

      validFrom: [undefined, []],
      validTo: [undefined, []]
    });
    this.markFormGroupTouched(newAccessSite);

    if (accessSite) {
      newAccessSite.patchValue({
        ...accessSite,
        validFrom: accessSite.validFrom ? this.datePipe.transform(accessSite.validFrom, 'yyyy-MM-dd') : null,
        validTo: accessSite.validTo ? this.datePipe.transform(accessSite.validTo, 'yyyy-MM-dd') : null
      });
    }

    return newAccessSite;
  }

  /**
   * Iterate over all form controls and make them touched
   *
   * @param formGroup
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private isValidDate(date): boolean {
    if (!date) {
      return false;
    }
    return typeof date === 'object';
  }
}
