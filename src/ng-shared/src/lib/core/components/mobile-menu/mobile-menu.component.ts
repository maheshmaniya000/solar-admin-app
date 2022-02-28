import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Config } from 'ng-shared/config';
import { HeaderCore } from 'ng-shared/core/components/header/header-core';
import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';
import { AuthenticationService } from 'ng-shared/user/services/authentication.service';


@Component({
  selector: 'sg-mobile-menu',
  styleUrls: ['./mobile-menu.component.scss'],
  templateUrl: './mobile-menu.component.html'
})
export class MobileMenuComponent extends HeaderCore implements OnInit {
  @Input() active: boolean;

  @Output() closeMobileMenu = new EventEmitter();

  isUserLoggedIn$: Observable<boolean>;

  constructor(
    authenticationService: AuthenticationService,
    router: Router,
    store: Store<any>,
    config: Config,
    dialog: MatDialog
  ) {
    super(authenticationService, router, store, config, dialog);
  }

  ngOnInit(): void {
    this.isUserLoggedIn$ = this.store.pipe(selectIsUserLogged);
  }
}
