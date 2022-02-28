const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,
  stories: [
    ...rootMain.stories,
    '../src/lib/**/*.stories.@(ts)',
  ]
};
