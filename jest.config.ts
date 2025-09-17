const { createDefaultPreset } = require('ts-jest')

const tsJestTransformCfg = createDefaultPreset().transform

const config: import('jest').Config = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
}

export default config
