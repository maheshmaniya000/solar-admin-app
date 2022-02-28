import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { Company, CompanyWithToken } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { UpdateCompany } from '../../../user/actions/company.actions';
import { selectActiveCompany } from '../../../user/selectors/company.selectors';
import { CompanyService } from '../../../user/services/company.service';

export function getBillingAddress(company: Company): string {
  return [
    company.street,
    company.city,
    company.zipCode,
    typeof company.state === 'string' || !company.state ? company.state : company.state.name,
    typeof company.country === 'string' || !company.country ? company.country : company.country.name
  ].filter(x => !!x).join(', ');
}

function shouldCompanyBeEdited(company: Company): boolean {
  if (!company) {return true;}
  return (
    !company.name ||
    !company.country ||
    !company.country.code ||
    !company.phone ||
    !company.city ||
    !company.street ||
    !company.zipCode ||
    (company.country.code === 'SK' && !company.VAT_ID)
  );
}

@Component({
  selector: 'sg-cart-step-two',
  templateUrl: './cart-step-two.component.html',
  styleUrls: ['./cart-step-two.component.scss']
})
export class CartStepTwoComponent extends SubscriptionAutoCloseComponent implements OnInit {

  company: Company;

  termsConfirmed: boolean;
  editedCompany: Company;

  editMode = false;
  isOnlyEditModeEnabled = false;
  shouldCompanyBeEdited = false;
  working = false;

  getBillingAddress = getBillingAddress;

  constructor(
    private readonly store: Store<any>,
    private readonly companyService: CompanyService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.store.pipe(selectActiveCompany).subscribe(
        company => {
          this.company = company;
          this.shouldCompanyBeEdited = shouldCompanyBeEdited(company);
          this.editMode = this.shouldCompanyBeEdited;
          this.isOnlyEditModeEnabled = this.shouldCompanyBeEdited;
        }
      )
    );

    this.route.queryParams.pipe(first()).subscribe(
      params => {
        if (params.edit) {this.editMode = true;}
      }
    );
  }

  companyEdit(company: Company): void {
    if (company) {
      this.editedCompany = company;
      this.shouldCompanyBeEdited = shouldCompanyBeEdited(company);
    }
  }

  continue(): void {
    if (this.editMode && this.editedCompany) {
      this.working = true;

      this.companyService.updateCompany(this.company.sgCompanyId, this.editedCompany).subscribe(
        (cwt: CompanyWithToken) => {
          this.store.dispatch(new UpdateCompany(cwt));
          this.working = false;
          this.navigateNext();
        }
      );
    } else {
      this.navigateNext();
    }
  }

  navigateNext(): void {
    this.router.navigate(['..', '3'], { relativeTo: this.route });
  }
}
