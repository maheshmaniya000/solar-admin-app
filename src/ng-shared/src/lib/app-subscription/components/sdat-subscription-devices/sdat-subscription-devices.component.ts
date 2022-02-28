import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { isNil } from 'lodash-es';

import { AppDevice, AppDeviceStatus, User } from '@solargis/types/user-company';

import { getAppDeviceKey } from 'ng-shared/utils/app-device.utils';

import { UpdateAppDeviceRequest } from '../../../app-device/update-app-device-request.model';

type Column =
  | 'userName'
  | 'email'
  | 'customName'
  | 'hostName'
  | 'company'
  | 'lastActivity'
  | 'registered'
  | 'osFingerprint';

@Component({
  selector: 'sg-sdat-subscription-devices',
  templateUrl: './sdat-subscription-devices.component.html',
  styleUrls: ['./sdat-subscription-devices.component.scss']
})
export class SDATSubscriptionDevicesComponent implements OnChanges, OnInit {
  tableColumns: (Column | 'status' | 'actions')[];
  dataSource: MatTableDataSource<AppDevice>;
  statusFilter: AppDeviceStatus | '' = '';

  @Input() devices: AppDevice[];
  @Input() users: User[];
  @Input() filter: User;
  @Input() columns: Column[];

  @Output() resetFilter: EventEmitter<void> = new EventEmitter();
  @Output() updateDevice: EventEmitter<UpdateAppDeviceRequest> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<AppDevice>();
    this.dataSource.paginator = this.paginator;
    this.setDataSourceData();
  }


  ngOnChanges(): void {
    this.tableColumns = ['status', ...this.columns, 'actions'];
    this.setDataSourceData();
  }

  setDataSourceData(): void {
    if (isNil(this.dataSource)) {
      return;
    }

    const filteredDevices = (this.devices || [])
      .filter(d => !this.filter || d.user?.sgAccountId === this.filter.sgAccountId)
      .filter(d => !this.statusFilter?.length || d.status === this.statusFilter);

    this.dataSource.data = filteredDevices;
    }

  selectedDevices(): AppDevice[] {
    return this.devices?.filter(d => d.status === 'active');
  }

  changeStatusFilter(status: AppDeviceStatus | ''): void {
    this.statusFilter = status;
    this.setDataSourceData();
  }

  getUserById(userId: string): User {
    return this.users?.find(user => user.sgAccountId === userId);
  }

  updateDeviceStatusByKey(device: AppDevice, status: AppDeviceStatus): void {
    this.updateDevice.emit({ key: getAppDeviceKey(device), update: { status } });
  }
}
