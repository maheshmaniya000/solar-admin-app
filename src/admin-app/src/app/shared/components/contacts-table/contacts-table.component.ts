import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ContactPerson } from '@solargis/types/user-company';

@Component({
  selector: 'sg-admin-contacts-table',
  styleUrls: ['./contacts-table.component.scss'],
  templateUrl: './contacts-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsTableComponent {
  readonly columns: string[] = [
    'firstName',
    'middleName',
    'lastName',
    'phone',
    'email'
  ];

  @Input() contacts: ContactPerson[];
}
