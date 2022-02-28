import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { ServerOptions } from 'https';
import { cwd } from 'process';
import * as url from 'url';
import { UrlObject } from 'url';

import * as compression from 'compression';
import express from 'express';
import proxy from 'http-proxy-middleware';
import * as morgan from 'morgan';
import nocache from 'nocache';
import 'reflect-metadata';

import { connectAll } from './database';
import { appsConfig, baseUrl, ensureBaseUrl } from './env';
import { environment } from './environments/environment';
import { eventBus } from './events';
import { initLogging } from './logging';
import api from './router/api.router';

export default function startServer(): void {
  const app = express();

  app.enable('trust proxy');

  app.use(morgan('dev')); // log requests to console

  // auto redirect to baseUrl, if enabled
  if (ensureBaseUrl) {
    app.use((req, res, next) => {
      const hostUrl = req.protocol + '://' + req.headers.host;
      if (hostUrl !== baseUrl) {
        console.log('Redirecting', hostUrl, '->', baseUrl);
        res.redirect(baseUrl + req.url);
      } else {next();}
    });
  }

  app.use('/api', api);

  app.use(compression({
    filter(req, res): boolean {
      if (req.headers['x-no-compression']) {return false;}
      else {return compression.filter(req, res);}
    }
  }));

  // redirect to default app - prospect
  app.get('/', (req, res) => res.redirect(
    url.format({ pathname: '/dashboard', query: req.query } as UrlObject))
  );

  // apps setup
  Object.entries(appsConfig).forEach(([appName, { dev: {proxyUrl}, prod }]) => {
    // serve production app from /dist/{appName}-app
    if (environment.production && prod) {
      app.get([`/${appName}`, `/${appName}/`, `/${appName}/index.html`], [nocache(), (req, res) => {
        res.sendFile(`./dist/apps/${appName}/index.html`, {root: cwd()});
      }]);
      app.use(`/${appName}`, express.static(`./dist/apps/${appName}`, { cacheControl: false }));
      app.get(`/${appName}/*`, [nocache(), (req, res) => {
        res.sendFile(`./dist/apps/${appName}/index.html`, {root: cwd()});
      }]);
    } else if (!environment.production) { // proxy dev app
      console.log(`Setting app proxy: ${baseUrl}/${appName} -> ${proxyUrl}`);
      app.use(`/${appName}`,
        proxy({
          target: proxyUrl,
          changeOrigin: true,
          pathRewrite: { ['^/' + appName]: '' },
          xfwd: true,
          // ws: true - causes problem when switching between apps
        })
      );
    }
  });

  // start server after all DBs are connected
  connectAll().then(
    () => {
      const port: number = parseInt(process.env.PORT, 10) || 5000;
      const httpsPort = process.env.HTTPS_PORT;
      const httpServer = http.createServer(app);

      httpServer.listen(port);

      eventBus.emit('listening', port);
      console.log(`App listening on port ${port}`);

      if (httpsPort) {
        const httpsOpts: ServerOptions = {
          key: process.env.HTTPS_KEY || fs.readFileSync('ssl/localhost.key', 'utf8'),
          cert: process.env.HTTPS_CERT || fs.readFileSync('ssl/localhost.crt', 'utf8'),
          requestCert: false,
          rejectUnauthorized: false
        };

        const httpsServer = https.createServer(httpsOpts, app);

        httpsServer.listen(httpsPort);

        eventBus.emit('listening secure', httpsPort);
        console.log(`App listening on secure port ${httpsPort}`);
      }
    },
    err => {
      console.error(`App failed to start: ${err}`);
      process.exit(0);
    }
  );
}

initLogging();
