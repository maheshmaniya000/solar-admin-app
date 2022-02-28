import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PasswordVisibilityToggleComponent } from './password-visibility-toggle.component';

@NgModule({
  declarations: [PasswordVisibilityToggleComponent],
  imports: [MatIconModule, MatButtonModule],
  exports: [PasswordVisibilityToggleComponent]
})
export class PasswordVisibilityToggleModule {}
