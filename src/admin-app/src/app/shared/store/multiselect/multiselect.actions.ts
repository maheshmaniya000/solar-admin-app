import { createAction, props } from '@ngrx/store';

export const multiselectActionsFactory = (namespace: string) => ({
  multiselect: createAction(`[${namespace}] Multiselect`, props<{ ids: string[] }>()),
  multiselectToggleAll: createAction(`[${namespace}] Multiselect Toggle All`),
  multiselectClear: createAction(`[${namespace}] Multiselect Clear`),
}) as const;
