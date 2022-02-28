import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { isNil } from 'lodash-es';
import { first, map } from 'rxjs/operators';

import { Company, CompanySnapshot } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { CompanySnapshotEditorComponent } from '../../../shared/components/company-snapshot-editor/company-snapshot-editor.component';
import { ContactsEditorComponent } from '../../../shared/components/contacts-editor/contacts-editor.component';
import { CompanyDetailStore } from '../../services/company-detail.store';

@Component({
  selector: 'sg-admin-company-editor',
  styleUrls: ['./company-editor.component.scss', '../../../shared/components/admin-common.styles.scss'],
  templateUrl: './company-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyEditorComponent implements OnChanges, OnInit {
  @Input() company: CompanySnapshot;

  form: FormGroup;

  constructor(readonly companyDetailStore: CompanyDetailStore) {}

  ngOnChanges(): void {
    this.patchForm();
  }

  ngOnInit(): void {
    this.createForm();
    this.companyDetailStore.entity$.pipe(first()).subscribe(company =>
      (company?.contacts ?? []).forEach(contact => {
        const contactFormGroup = ContactsEditorComponent.createFormGroup();
        this.getContactsFormArray().push(contactFormGroup);
        contactFormGroup.patchValue(contact);
      })
    );
    this.companyDetailStore.setValid(this.form.statusChanges.pipe(map(status => status === 'VALID')));
    this.form.valueChanges.subscribe(() => this.companyDetailStore.setUnsavedEntity(this.getFormValue()));
    this.patchForm();
  }

  getContactsFormArray(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  onAddContactButtonClick(): void {
    this.getContactsFormArray().push(ContactsEditorComponent.createFormGroup());
  }

  private createForm(): void {
    const fb = new FormBuilder();
    this.form = fb.group({
      ...CompanySnapshotEditorComponent.createControlConfigs(),
      contacts: fb.array([])
    });
  }

  private getFormValue(): Company {
    const company: Company = CompanySnapshotEditorComponent.getFormValue(this.form) as Company;
    if (!isNil(company.contacts)) {
      company.contacts = company.contacts.map(contact => removeEmpty(contact, false, true));
    }
    return company;
  }

  private patchForm(): void {
    this.form?.reset(this.company ?? {});
  }
}
