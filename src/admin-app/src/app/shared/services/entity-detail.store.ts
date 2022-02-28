import { ComponentStore } from '@ngrx/component-store';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';

import { removeEmpty } from '@solargis/types/utils';

export interface EntityDetailState<T> {
  entity: T;
  unsavedEntity: T;
  updating: boolean;
  valid: boolean;
}

export interface EntityDetailViewModel<T> {
  entity: T;
  valid: boolean;
  saveDisabled: boolean;
  updating: boolean;
  unsavedChanges: boolean;
}

export abstract class EntityDetailStore<T, S extends EntityDetailState<T> = EntityDetailState<T>> extends ComponentStore<S> {
  readonly setEntity = this.updater((state, entity: T) => ({
    ...state,
    entity
  }));

  setUnsavedEntity = this.updater((state, unsavedEntity: Partial<T>) => ({
    ...state,
    unsavedEntity: {
      ...state.entity,
      ...unsavedEntity
    }
  }));

  readonly clearChanges = this.updater((state, entity: T) => ({
    ...state,
    entity,
    unsavedEntity: entity
  }));

  readonly setUpdating = this.updater((state, updating: boolean) => ({
    ...state,
    updating
  }));

  readonly setValid = this.updater((state, valid: boolean) => ({
    ...state,
    valid
  }));

  readonly entity$ = this.select(({ entity }) => entity);
  readonly unsavedEntity$ = this.select(({ unsavedEntity }) => unsavedEntity);
  readonly unsavedChanges$ = this.select(
    ({ entity, unsavedEntity }) => !isEqual(removeEmpty(entity, true, true, true), removeEmpty(unsavedEntity, true, true, true))
  );

  readonly viewModel$ = this.createViewModel$();

  protected constructor(state?: Omit<S, keyof EntityDetailState<T>>) {
    super(
      Object.assign(
        {},
        {
          entity: undefined,
          unsavedEntity: undefined,
          updating: false,
          valid: true
        },
        state
      ) as S
    );
  }

  protected createViewModel$(): Observable<EntityDetailViewModel<T>> {
    return this.select(this.state$, this.unsavedChanges$, (state, unsavedChanges) => ({
      entity: state.entity,
      valid: state.valid,
      unsavedChanges,
      saveDisabled: !state.valid || !unsavedChanges || state.updating,
      updating: state.updating
    }));
  }
}
