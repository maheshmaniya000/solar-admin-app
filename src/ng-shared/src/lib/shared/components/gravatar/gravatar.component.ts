import { Component, Input, OnChanges } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';

import { Company, User } from '@solargis/types/user-company';

@Component({
  selector: 'sg-gravatar',
  templateUrl: './gravatar.component.html',
  styleUrls: ['./gravatar.component.scss']
})
export class GravatarComponent implements OnChanges {
  @Input() company: Company;
  @Input() user: User;

  hasGravatarImage: boolean = true;
  imgSrc: string;
  companyName: string;
  companyId: string;

  ngOnChanges(): void {
    this.companyName = this.company?.name;
    this.companyId = this.company?.sgCompanyId;

    if (this.user?.email) {
      const emailHash = Md5.hashStr(this.user.email.trim().toLowerCase());
      this.imgSrc = `//www.gravatar.com/avatar/${emailHash}?d=404`;
    } else {
      // FIXME why such dummy URL (and hardcoded protocol) ???
      this.imgSrc = `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=150`;
    }
  }

  errorHandler(): void {
    this.hasGravatarImage = false;
  }
}
