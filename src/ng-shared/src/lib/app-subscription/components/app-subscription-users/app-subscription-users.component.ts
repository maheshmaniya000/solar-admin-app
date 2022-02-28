import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DetailNavigationService } from 'src/admin-app/src/app/shared/services/detail-navigation.service';

import { AppDevice, User } from '@solargis/types/user-company';

import { TokenDialogComponent } from '../token-dialog/token.dialog';


@Component({
  selector: 'sg-app-subscription-users',
  templateUrl: './app-subscription-users.component.html',
  styleUrls: ['./app-subscription-users.component.scss']
})
export class AppSubscriptionUsersComponent implements OnChanges {
  columns = ['checkbox', 'name', 'devices', 'email'];
  dataSource: MatTableDataSource<User>;

  @Input() users: User[];
  @Input() selectedUsers: { [key: string]: boolean };
  @Input() devices: AppDevice[];
  @Input() devicesPerUser: number;
  @Input() isTMY: boolean;

  @Input() isEdit: boolean;
  @Input() tokenData: [];
  @Output() edittoken: EventEmitter<boolean> = new EventEmitter();

  @Output() selectUser: EventEmitter<{ id: string; checked: boolean }> = new EventEmitter();
  @Output() selectAllUsers: EventEmitter<boolean> = new EventEmitter();
  @Output() clickOnUser: EventEmitter<User> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(public dialog: MatDialog, private readonly detailNavigationService: DetailNavigationService,){
  }

  ngOnChanges(): void {
    if (!this.isEdit) {
      this.dataSource = new MatTableDataSource<User>(this.users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      if (!this.devices) {
        this.columns = ['checkbox', 'name', 'email'];
      }
      if (this.isTMY) {
        // this.columns.push('generation_date');
        this.columns.push('active_token');

        this.columns.push('action');
      }
    }
    else {
      this.columns = ['Tokenid', 'genartedate', 'action'];
      this.dataSource = new MatTableDataSource<any>(this.tokenData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    // this.dataSource = new MatTableDataSource<User>(this.users);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    // if (!this.devices) {
    //   this.columns = ['checkbox', 'name', 'email'];
    // }

    // if(this.isTMY){
    //   // this.columns.push('generation_date');
    //   this.columns.push('active_token');

    //   this.columns.push('action');
    // }
  }

  selectedUsersCount(): number {
    return this.selectedUsers
      ? Object.values(this.selectedUsers)?.filter(selected => selected)?.length
      : 0;
  }

  userDevicesCount(id: string): number {
    return this.devices?.filter(d => d.status === 'active' && d.user?.sgAccountId === id)?.length;
  }

  generateToken(user: User): void{
    this.dialog.open(TokenDialogComponent).afterClosed().subscribe(result => {
      console.log(`Token generated`);
      console.log(result);
      console.log(user);
    });
  }

  regenerateToken(user: User): void{
    console.log(`Regenerating token for ${user.sgAccountId}`);
  }

  editToken(user: User): void {
    console.log(`Edit token for ${user.sgAccountId}`);
    this.detailNavigationService.toViewtokens('tmy-view-token');
  }

  deleteToken(user: User): void {
    console.log(`Deleting token for ${user.sgAccountId}`);
  }

}
