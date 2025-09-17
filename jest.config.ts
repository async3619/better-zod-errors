import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

const config: import('jest').Config = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  transform: {
    ...tsJestTransformCfg,
  },
}

export default config
