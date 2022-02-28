import { VersionedDatasetMetadataMap } from '@solargis/types/dataset/data.types';
import { SolargisApp } from '@solargis/types/user-company';

import { Actions, METADATA_LOADED } from '../actions/metadata.actions';

export type MetadataState = Partial<Record<SolargisApp, VersionedDatasetMetadataMap>>;

export function metadataReducer(state: MetadataState = {}, action: Actions): MetadataState {
  switch (action.type) {
    case METADATA_LOADED: {
      return { ...state, [action.payload.app]: action.payload.metadata };
    }
    default: {
      return state;
    }
  }
}
