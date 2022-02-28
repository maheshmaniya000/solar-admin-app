import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { first } from 'rxjs/operators';

import { Project, ProjectId } from '@solargis/types/project';
import { Company, CompanyRef, CompanyWithToken } from '@solargis/types/user-company';

import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany, selectCompanyList } from 'ng-shared/user/selectors/company.selectors';
import { UserState } from 'ng-shared/user/types';

import { BulkUpdate } from '../../actions/project.actions';
import { State } from '../../reducers';
import { selectProjects } from '../../selectors/project.selectors';


@Component({
  selector: 'sg-transfer-projects-dialog',
  styleUrls: [ './transfer-projects-dialog.component.scss' ],
  templateUrl: './transfer-projects-dialog.component.html'
})
export class TransferProjectsDialogComponent implements OnInit {

  columns = ['selected', 'name'];

  projectIds: ProjectId[];

  activeCompany: Company;
  companies: Company[];
  user: UserState;

  selectedCompany: Company = null;

  ownerOfAllProjects: boolean;
  allCompanyProjects: boolean;

  userAccount = { sgCompanyId: null };

  constructor(
    private readonly store: Store<State>,
    private readonly dialogRef: MatDialogRef<TransferProjectsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.projectIds = data.projectIds;
  }

  ngOnInit(): void {
    combineLatest(
      this.store.pipe(selectProjects(this.projectIds)),
      this.store.pipe(selectUser),
      this.store.pipe(selectCompanyList),
      this.store.pipe(selectActiveOrNoCompany)
    ).pipe(
      first()
    ).subscribe(([projects, user, companies, activeCompany]: [Project[], UserState, CompanyWithToken[], Company]) => {

      // check owner
      this.companies = companies.map(cwt => cwt.company);
      this.user = user;

      const sgAccountId = user.sgAccountId;

      this.ownerOfAllProjects = projects.every(
        project => !!project.access.find(
          access => access.role === 'owner' && access.user.sgAccountId === sgAccountId
        )
      );

      this.allCompanyProjects = projects.every(project => !!project.company);

      this.activeCompany = activeCompany;
      this.selectedCompany = activeCompany;
    });
  }

  isNothingChanged(): boolean {
    return this.selectedCompany === this.activeCompany;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  transferProjects(): void {
    const company = this.getSelectedCompanyRef();
    this.store.dispatch(new BulkUpdate({ _id: this.projectIds, update: { company } }));
    this.closeDialog();
  }

  getSelectedCompanyRef(): CompanyRef | null {
    if (this.activeCompany.sgCompanyId  === null) {
      return null;
    }
    const { sgCompanyId, name } = this.activeCompany;
    return { sgCompanyId, name };
  }

}
