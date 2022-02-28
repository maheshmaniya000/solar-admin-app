import { InitialOptionsTsJest } from 'ts-jest/dist/types';

const transformIgnoreModules = ['lodash-es', '@babylonjs'].join('|');

interface ProjectConfig {
  name: string;
  library?: boolean;
}

export const createJestConfig = (projectConfig: ProjectConfig): InitialOptionsTsJest => ({
  displayName: projectConfig.name,
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: `../../coverage/${projectConfig.library ? 'libs' : 'apps'}/${projectConfig.name}`,
  restoreMocks: true,
  testRunner: 'jest-jasmine2'
});

export const createAngularJestConfig = (projectConfig: ProjectConfig): InitialOptionsTsJest => {
  const baseJestConfig = createJestConfig(projectConfig);
  return {
    ...baseJestConfig,
    setupFilesAfterEnv: ['<rootDir>/../../tools/angular-test-setup.ts'],
    globals: {
      'ts-jest': {
        ...baseJestConfig.globals?.['ts-jest'],
        stringifyContentPathRegex: '\\.(html|svg)$',
        isolatedModules: true
      }
    },
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(ts|js|html)$': 'jest-preset-angular',
      '\\.grass$': 'jest-raw-loader'
    },
    transformIgnorePatterns: [`/node_modules/(?!${transformIgnoreModules})`],
    moduleNameMapper: {
      '^.+\\.(css|less|scss)$': 'identity-obj-proxy'
    },
    snapshotSerializers: [
      'jest-preset-angular/build/serializers/no-ng-attributes',
      'jest-preset-angular/build/serializers/ng-snapshot',
      'jest-preset-angular/build/serializers/html-comment'
    ]
  };
};
