import { createSelector, MemoizedSelector } from '@ngrx/store';

import { isNotEmpty } from 'components/utils';

import * as fromAdmin from '../../../store/app.reducer';
import { MultiselectState } from './multiselect.reducer';

export const multiselectSelectorFactory = (selectState: MemoizedSelector<fromAdmin.State, MultiselectState>): {
  selectCount: MemoizedSelector<fromAdmin.State, number>;
  selectMultiselect: MemoizedSelector<fromAdmin.State, string[]>;
  selectAllSelected: MemoizedSelector<fromAdmin.State, boolean>;
  selectMultiselectActive: MemoizedSelector<fromAdmin.State, boolean>;
} => {
  const selectCount = createSelector(selectState, state => state.count);
  const selectMultiselect = createSelector(selectState, state => state.multiselect);
  const selectAllSelected = createSelector(
    selectMultiselect,
    selectCount,
    (multiselect, count) => multiselect.length === count && multiselect.length > 0
  );
  const selectMultiselectActive = createSelector(selectMultiselect, isNotEmpty);

  return {
    selectCount,
    selectMultiselect,
    selectAllSelected,
    selectMultiselectActive
  };
};
