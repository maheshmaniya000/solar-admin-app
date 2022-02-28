import * as bodyParser from 'body-parser';
import { Router } from 'express';

import { DatasetFilterOpts, filterDataset } from '@solargis/dataset-core';
import { LtaService } from '@solargis/prospect-service';
import { latlngFromUrlParam } from '@solargis/types/site';

import { injector, ltaServiceToken } from '../injector';
import { ltaDataset } from '../models/prospect-config';
import { fupMiddleware } from '../service/fup/fup-middleware';


const router: Router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const ltaServicePromise: Promise<LtaService> = injector.get(ltaServiceToken);

const ltaFilterOpts: DatasetFilterOpts = {
  removeEmpty: true,
  metadata: { source: false }
};

router.get('/lta', [
  fupMiddleware('lta', [
    { type: 'FUP-SPECIFIC-USER-RULE', config: 'fup-specific-user' },
    { type: 'FUP-LOGGED-USER-RULE', config: 'fup-logged-common' },
    { type: 'FUP-ANONYMOUS-RULE', config: 'fup-anonymous-common' }
  ])
], (req, res) => {
  const { query: { loc, keys: keysParam }, permissions: access } = req;
  const point = latlngFromUrlParam(loc);
  const keys = typeof keysParam === 'string' ? keysParam.split(',') : keysParam;

  ltaServicePromise
    .then(ltaService => ltaService.load(point))
    .then(ltaData => filterDataset(ltaDataset, ltaData, { ...ltaFilterOpts, access, keys }))
    .then(output => res.json(output));
});

export default router;
