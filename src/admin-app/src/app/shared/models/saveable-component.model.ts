import { Observable } from 'rxjs';

export interface SaveableComponent {
  hasUnsavedChanges(): Observable<boolean>;
}
