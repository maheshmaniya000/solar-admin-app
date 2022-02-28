# Solargis Apps

This project was generated using [Nx](https://nx.dev).

NX workspace is used to manage multiple libs and apps, project directory is either `libs` for libraries or `apps` for applications and default project is `prospect`.

Most of the projects in this workspace are Angular applications/libraries. There are also 2 Node Express applications: `server` (some code is shared between client and server) and `storybook`.

### Installing NX cli globally
To run nx commands, install NX cli globally:

`npm i -g nx`


### Quick Start & Documentation
[Nx Documentation](https://nx.dev/angular)

[10-minute video showing all Nx features](https://nx.dev/getting-started/intro)

[Interactive Tutorial](https://nx.dev/tutorial/01-create-application)

## Application Configuration

Application configuration file (local development) is in file '[APP_ROOT]/**.env**'. Example of configuration file: '[APP_ROOT]/**.env-example**' (just rename .env-example to .env and application ready to start). 

## Environment Config Vars

Run `heroku config -s -a solargis2-apps > .env` to retrieve config variables from Heroku, change variables if desired. Ask for `solargis2-apps` access if needed.
Be careful with database keys, prefer local databases or delete DB keys.

## Usage

#### Develop all-in-one: `npm run dev`
Runs server and **_all_** apps in development mode. All apps will automatically reload after source code is changed. When server code is changed server will be restarted and apps will be reloaded too.
Cross-linking between applications will work and JWT tokens will be reused. 

Navigate to http://localhost:5000 or directly into application:
- http://localhost:5000/admin 
- http://localhost:5000/prospect

To launch also evaluate app in development mode, run `npm run app:evaluate:dev`
Evaluate app is not yet actively developed, so it is not contained in all-in-one dev script.

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

### Publish new feature version of libs

Before merging to development, we may publish feature version separately, with following commands:

(All changes in feature branch has to be committed and pushed) 

    npm run build
    lerna publish 9.7.3-jira.1234.0 --dist-tag some-tag

And apply the feature fersion in feature branches.

More info about versioning libs on [wiki](https://wiki.solargis.com/display/SG2/Solargis+NPM+Libs)

### Publish new version

All changes in repository has to be committed and pushed.

    npm run publish

Is defined as: `lerna publish` and hooks `push` and `build` before publishing.
Lerna will guide selecting a new version number.

- only changed packages are published with new version.

## Storybook
Some apps and libraries might use storybook to showcase shareable components. 

### Develop
To run storybook for given project in development mode:

`nx storybook <project>`, e.g. `nx storybook components`

and navigate to `http://localhost:4400/`

### Production
To build production version of all storybooks and storybook server app:

`npm run build:pipeline:storybook`

or

* `nx build storybook` and
* `npm run storybook:build`

and then run node express app:

`npm run storybook:prod`

Storybook for given project is then available on:

http://localhost:4400/<project>/, e.g.: http://localhost:4400/components/

# Solargis API dependencies

SG2 app depends on multiple APIs: 
- `${API_BASE_PROJECT} || ${API_BASE}/project`: Project API (CDK)
- `${API_BASE_USER_TAG || ${API_BASE}/user-tag`: User tag API (CDK)
- `${API_BASE}/ws/contract`: WS contract API (Serverless)

`API_BASE` is defined in `.env` file, optionally `API_BASE_PROJECT`, `API_BASE_USER_TAG` for APIs running locally.

## Local Project API and User tags API

1. checkout project: https://gitlab.solargis.com/cdk/solargis2-apis-cdk into separate directory
2. install project dependencies `npm install`
3. build tools and scripts `npm run tools:build`
4. start project locally `npm start`

5. in SG2 apps, add `API_BASE_PROJECT=http://localhost:4000/project` and `API_BASE_USER_TAG=http://localhost:4000/user-tag` in `.env`
6. run SG2 apps `npm run dev`
