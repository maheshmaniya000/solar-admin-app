import { Directive, HostBinding } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: `[sg-dialog-footer], sg-dialog-footer, sgDialogFooter`
})
export class DialogFooterDirective {
  @HostBinding('class.sg-dialog-footer')
  sgDialogFooterContentClass = true;
}
