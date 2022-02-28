import { createSelector, MemoizedSelector } from '@ngrx/store';

import { VersionedDatasetMetadataMap } from '@solargis/types/dataset';
import { SolargisApp } from '@solargis/types/user-company';

import { State } from '../reducers';
import { MetadataState } from '../reducers/metadata.reducer';

export const getMetadataState = (state: State): MetadataState => state.project.metadata;

export const selectAppMetadata = (app: SolargisApp): MemoizedSelector<State, VersionedDatasetMetadataMap> =>
    createSelector(getMetadataState, state => state[app]);
