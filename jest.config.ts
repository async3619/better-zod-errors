import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

const config: import('jest').Config = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
}

export default config
