import generateCodeFrame from '@atlaspack/codeframe'
import jsonMap from 'json-source-map'
import type z from 'zod'

function pathToPointer(path: PropertyKey[]): string {
  if (path.length === 0) {
    return ''
  }

  return (
    '/' +
    path
      .map((segment) => {
        if (typeof segment === 'number') {
          return segment.toString()
        }
        return segment.toString().replace(/~/g, '~0').replace(/\//g, '~1')
      })
      .join('/')
  )
}

interface FormatErrorOptions {
  useColor?: boolean
  syntaxHighlighting?: boolean
}

export function formatError(
  issue: z.core.$ZodIssue,
  payload: number | bigint | boolean | string | object,
  options?: FormatErrorOptions,
): string {
  const { useColor = true, syntaxHighlighting = true } = options ?? {}

  const { json, pointers } = jsonMap.stringify(payload, null, 2)
  const targetPointer = pointers[pathToPointer(issue.path)]
  if (!targetPointer) {
    throw new Error(`Could not find pointer for path: ${issue.path.join('.')}`)
  }

  return generateCodeFrame(
    json,
    [
      {
        start: {
          line: targetPointer.value.line + 1,
          column: targetPointer.value.column + 1,
        },
        end: {
          line: targetPointer.valueEnd.line + 1,
          column: targetPointer.valueEnd.column,
        },
        message: issue.message,
      },
    ],
    { useColor, syntaxHighlighting, language: 'json' },
  )
}
