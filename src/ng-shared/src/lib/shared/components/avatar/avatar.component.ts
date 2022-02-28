import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'sg-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnChanges {
  @Input() sgCompanyId: string;
  @Input() name: string;
  splittedName: string[];
  firstInitial: string;
  secondInitial: string;
  avatarColor: string;

  colors = ['#4293D8', '#96C34D', '#F4B400', '#F36B2E', '#C674C6', '#6F7C91'];

 ngOnChanges(): void {
  this.splittedName = this.name.trim().split(' ');

  if (this.splittedName.length > 1) {
    this.firstInitial = this.splittedName[0].charAt(0);
    this.secondInitial = this.splittedName[1].charAt(0);
  } else {
    this.firstInitial = this.name.charAt(0);
    this.secondInitial = this.name.charAt(1);
  }

  this.avatarColor = this.getCompanyColor(this.sgCompanyId);
 }


  getCompanyColor(sgCompanyId: string): string {
    try{
      // eslint-disable-next-line radix
      const color = this.colors[parseInt(sgCompanyId.split('|')[1]) % this.colors.length];
      return color;
    } catch(e) {
      return this.colors[0];
    }
  }
}
