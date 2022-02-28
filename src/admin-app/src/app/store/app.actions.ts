import { createAction, props } from '@ngrx/store';

export const showSnackbar = createAction(
  '[Admin] Show Snackbar',
  props<{ message: string; styleClass: 'snackbarPass' | 'snackbarError'; duration?: number }>()
);

export const updateColumnsSettings = createAction('[Admin] Update column settings', props<{ table: string; columns: string[] }>());
