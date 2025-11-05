import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  setupFilesAfterEnv: [
    'dotenv/config',
    '<rootDir>/tests/config/setup.ts',
  ],
  moduleFileExtensions: ['ts', 'js'],
};

export default config;
