import { EntityState } from '@ngrx/entity';
import { ActionCreator, on, ReducerTypes } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';

export interface MultiselectState {
  multiselect: string[];
  count?: number;
}

export const multiselectReducerFactory = <S extends MultiselectState & Pick<EntityState<any>, 'ids'>>(
  select: ActionCreator<string, (props: {ids: string[]}) => ({ids: string[]} & TypedAction<string>)>,
  clear:  ActionCreator<string, () => TypedAction<string>>,
  selectAll: ActionCreator<string, () => TypedAction<string>>
): ReducerTypes<S, [any]>[] => [
  on<S, [typeof select]>(select, (state, { ids }) => ({ ...state, multiselect: ids ?? [] })),
  on<S, [typeof clear]>(clear, state => ({ ...state, multiselect: [] })),
  on<S, [typeof selectAll]>(selectAll, state => ({
    ...state,
    multiselect: state.multiselect.concat((state.ids as string[]).filter(id => !state.multiselect.includes(id)))
  }))
];
