import * as AWS from 'aws-sdk';
import * as bluebird from 'bluebird';
import * as bodyParser from 'body-parser';
import { Router } from 'express';
import jwt from 'express-jwt';
import * as methodOverride from 'method-override';
import nocache from 'nocache';


AWS.config.setPromisesDependency(bluebird); // FIXME candidate to remove

import { getClientConfig } from '../service/client-config';
import data from './data.router';
import { setCompanyToken } from './middlewares/company.middleware';
import { ipBlacklistMiddleware } from './middlewares/ip-blacklist.middleware';
import {
  jwtOpts,
  setPermissions,
  setUserRef
} from './middlewares/jwt.middleware';

const router: Router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(methodOverride());

router.use(ipBlacklistMiddleware);

router.use(jwt(jwtOpts), setUserRef, setCompanyToken, setPermissions);

router.get('/config/:app', [nocache()], async (req, res) => {
  const app = req.params.app;
  const config = await getClientConfig(app, req.ip);
  res.json(config);
});

// init sub-routes
router.use('/data', data);

// handle errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err, req, res, next) => {
  const { status, code } = err;
  if (status && code) {
    res.status(status).send({
      status: false,
      code
    });
  } else {
    res.status(status || 500).send({
      ...err,
      status: false
    });
  }
});

export default router;
