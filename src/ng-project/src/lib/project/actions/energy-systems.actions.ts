import { Action } from '@ngrx/store';

import { EnergySystem, EnergySystemRef, UpdateEnergySystemOpts } from '@solargis/types/project';
import { PvConfig } from '@solargis/types/pv-config';

import { ErrorType } from '../types/error.types';

// error
export const ENERGY_SYSTEM_ERROR = '[energy system] error';

// load for project
export const ENERGY_SYSTEM_LOAD = '[energy systems] load';
export const ENERGY_SYSTEM_LOADED = '[energy systems] loaded';

// save pv-config
export const ENERGY_SYSTEM_SAVE_PV_CONFIG = '[energy system] save pv-config';
export const ENERGY_SYSTEM_SAVED = '[energy system] saved';

// update
export const ENERGY_SYSTEM_UPDATE = '[energy system] update';
export const ENERGY_SYSTEM_UPDATED = '[energy system] updated';

// delete
export const ENERGY_SYSTEM_DELETE = '[energy system] delete';
export const ENERGY_SYSTEM_DELETED = '[energy system] deleted';

export type SavePvConfigOpts = {
  systemRef: EnergySystemRef;
  name?: string;
  isDefault?: boolean;
  pvConfig: PvConfig;
};

export type EnergySystemProgressKey = 'load' | 'save' | 'update' | 'delete';

export class EnergySystemError implements Action {
  readonly type = ENERGY_SYSTEM_ERROR;
  constructor(public payload: EnergySystemRef & { error: ErrorType; progressKey: EnergySystemProgressKey }) {}
}

export class EnergySystemLoad implements Action {
  readonly type = ENERGY_SYSTEM_LOAD;
  constructor(public payload: EnergySystemRef) {}
}

export class EnergySystemLoaded implements Action {
  readonly type = ENERGY_SYSTEM_LOADED;
  constructor(public payload: EnergySystemRef & { energySystems: EnergySystem[] }) {}
}

export class PvConfigSave implements Action {
  readonly type = ENERGY_SYSTEM_SAVE_PV_CONFIG;
  constructor(public payload: SavePvConfigOpts) {}
}

export class PvConfigSaved implements Action {
  readonly type = ENERGY_SYSTEM_SAVED;
  constructor(public payload: EnergySystem) {}
}

export class EnergySystemUpdate implements Action {
  readonly type = ENERGY_SYSTEM_UPDATE;
  constructor(public payload: { systemRef: EnergySystemRef; update: UpdateEnergySystemOpts }) {}
}

export class EnergySystemUpdated implements Action {
  readonly type = ENERGY_SYSTEM_UPDATED;
  constructor(public payload: { update: UpdateEnergySystemOpts; updatedSystem: EnergySystem }) {}
}

export class EnergySystemDelete implements Action {
  readonly type = ENERGY_SYSTEM_DELETE;
  constructor(public payload: EnergySystemRef) {}
}

export class EnergySystemDeleted implements Action {
  readonly type = ENERGY_SYSTEM_DELETED;
  constructor(public payload: EnergySystemRef) {}
}

export type Actions = EnergySystemError
  | EnergySystemLoad | EnergySystemLoaded
  | PvConfigSave | PvConfigSaved
  | EnergySystemUpdate | EnergySystemUpdated
  | EnergySystemDelete | EnergySystemDeleted;
