import z from 'zod'
import { formatError } from './formatError.ts'

describe('formatError', () => {
  describe('Error Formatting', () => {
    it('should format errors with code frames', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
        address: z.object({
          street: z.string(),
          city: z.string(),
        }),
      })

      const payload = {
        name: 'John Doe',
        age: -5,
        address: {
          street: '123 Main St',
          city: 456, // Invalid type
        },
      }

      const result = schema.safeParse(payload)

      if (!result.success) {
        const formattedErrors = result.error.issues.map((issue) =>
          formatError(issue, payload, {
            useColor: false,
            syntaxHighlighting: false,
          }),
        )

        formattedErrors.forEach((error) => {
          expect(error).toMatchSnapshot()
        })
      } else {
        throw new Error('Validation should have failed')
      }
    })

    it('should handle nested errors correctly', () => {
      const schema = z.object({
        user: z.object({
          id: z.uuid(),
          profile: z.object({
            email: z.email(),
            phone: z.string().optional(),
          }),
        }),
      })

      const payload = {
        user: {
          id: 'invalid-uuid',
          profile: {
            email: 'not-an-email',
          },
        },
      }

      const result = schema.safeParse(payload)

      if (!result.success) {
        const formattedErrors = result.error.issues.map((issue) =>
          formatError(issue, payload, {
            useColor: false,
            syntaxHighlighting: false,
          }),
        )

        formattedErrors.forEach((error) => {
          expect(error).toMatchSnapshot()
        })
      } else {
        throw new Error('Validation should have failed')
      }
    })

    it('should format errors in arrays', () => {
      const schema = z.array(
        z.object({
          id: z.number(),
          value: z.string().min(3),
        }),
      )

      const payload = [
        { id: 1, value: 'ok' },
        { id: 2, value: 'no' }, // Invalid, too short
        { id: 'three', value: 'valid' }, // Invalid, id should be number
      ]

      const result = schema.safeParse(payload)

      if (!result.success) {
        const formattedErrors = result.error.issues.map((issue) =>
          formatError(issue, payload, {
            useColor: false,
            syntaxHighlighting: false,
          }),
        )

        formattedErrors.forEach((error) => {
          expect(error).toMatchSnapshot()
        })
      } else {
        throw new Error('Validation should have failed')
      }
    })

    it('should handle root level errors', () => {
      const schemaArray = [
        z.number().min(0),
        z.string().min(3),
        z.array(z.boolean()),
      ]

      const payloads = [-1, 'no', [true, 'false', 123]]

      payloads.forEach((payload, index) => {
        const schema = schemaArray[index]
        if (!schema) {
          throw new Error(`Schema not found for index ${index}`)
        }

        const result = schema.safeParse(payload)
        if (!result.success) {
          const formattedErrors = result.error.issues.map((issue) =>
            formatError(issue, payload, {
              useColor: false,
              syntaxHighlighting: false,
            }),
          )

          formattedErrors.forEach((error) => {
            expect(error).toMatchSnapshot()
          })
        }
      })
    })
  })

  describe('Options Handling', () => {
    it('should respect `useColor` option', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
      })

      const payload = {
        name: 'John Doe',
        age: -5,
      }

      const result = schema.safeParse(payload)

      if (!result.success) {
        const [issue] = result.error.issues
        if (!issue) {
          throw new Error('No issues found in the error')
        }

        const errorWithColor = formatError(issue, payload, {
          useColor: true,
          syntaxHighlighting: false,
        })
        const errorWithoutColor = formatError(issue, payload, {
          useColor: false,
          syntaxHighlighting: false,
        })

        expect(errorWithColor).not.toEqual(errorWithoutColor)
      } else {
        throw new Error('Validation should have failed')
      }
    })

    it('should respect `syntaxHighlighting` option', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
      })

      const payload = {
        name: 'John Doe',
        age: -5,
      }

      const result = schema.safeParse(payload)

      if (!result.success) {
        const [issue] = result.error.issues
        if (!issue) {
          throw new Error('No issues found in the error')
        }

        const errorWithHighlighting = formatError(issue, payload, {
          useColor: false,
          syntaxHighlighting: true,
        })
        const errorWithoutHighlighting = formatError(issue, payload, {
          useColor: false,
          syntaxHighlighting: false,
        })

        expect(errorWithHighlighting).not.toEqual(errorWithoutHighlighting)
      } else {
        throw new Error('Validation should have failed')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should throw error if path does not exist in payload', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
      })

      const payload = {
        name: 'John Doe',
        age: -5,
      }

      const result = schema.safeParse(payload)

      if (!result.success) {
        const invalidPayload = { ...payload, age: undefined } // Remove age to simulate missing path
        const [issue] = result.error.issues
        if (!issue) {
          throw new Error('No issues found in the error')
        }

        expect(() =>
          formatError(issue, invalidPayload, {
            useColor: false,
            syntaxHighlighting: false,
          }),
        ).toThrow(`Could not find pointer for path: ${issue.path.join('.')}`)
      } else {
        throw new Error('Validation should have failed')
      }
    })
  })
})
