import { MatDialogConfig } from '@angular/material/dialog';

export type DialogConfig<D = any> = Pick<MatDialogConfig<D>, 'data' | 'disableClose'>;
