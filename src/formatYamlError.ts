import generateCodeFrame from '@atlaspack/codeframe'
import yaml from 'js-yaml'
import SourceMap from 'js-yaml-source-map'
import type z from 'zod'

interface FormatYamlErrorOptions {
  useColor?: boolean
  syntaxHighlighting?: boolean
}

function processYamlPath(path: PropertyKey[]): PropertyKey[] {
  if (typeof path[0] === 'number') {
    if (path[0] === 0) {
      return path.slice(1)
    }
  }

  return path
}

export function formatYamlError(
  issue: z.core.$ZodIssue,
  payload: number | bigint | boolean | string | object,
  options?: FormatYamlErrorOptions,
): string {
  const { useColor = true, syntaxHighlighting = true } = options ?? {}

  const map = new SourceMap()
  const serialized = yaml.dump(payload)
  yaml.load(serialized, { listener: map.listen() })

  const position = map.lookup(processYamlPath(issue.path).join('.'))
  if (!position) {
    throw new Error(`Could not find position for path: ${issue.path.join('.')}`)
  }

  return generateCodeFrame(
    serialized,
    [
      {
        start: {
          line: position.line,
          column: position.column,
        },
        end: {
          line: position.line,
          column: position.column,
        },
        message: issue.message,
      },
    ],
    { useColor, syntaxHighlighting, language: 'yaml' },
  )
}
