### Develop server only: 

`npm run server:dev` or

`nx serve server`

Runs server in development mode. Internal api will be available for testing: http://localhost:5000/api
When server code is changed server will be restarted.

To launch all apps in development mode, run: `npm run apps:dev`

### Develop app with server

* `npm run dev:admin`
* `npm run dev:dashboard`
* `npm run dev:prospect`

Runs server and app in development mode. 
App will automatically reload after source code is changed. When server code is changed server will be restarted and app will be reloaded too.
Cross-linking between applications will not work.

Navigate to http://localhost:5000/<app>, e.g.: http://localhost:5000/admin

To run additional frontend app in development mode, run `nx serve <app>`, e.g. `nx serve admin`.

### Production build
Generate production code for server and all apps in the dist folder.
Run in separate terminals:
- `npm run apps:build`
  or per app: 
  - `nx build <app>`, e.g. `nx build admin`
- `nx build server`
- `npm run server:prod` (after previous two are done compiling)

Now both server and apps are served in their production version from static assets, without hot reload.

Navigate to http://localhost:5000 or directly into application:
- http://localhost:5000/admin
- http://localhost:5000/prospect