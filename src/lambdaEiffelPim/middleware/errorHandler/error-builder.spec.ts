import { Logger } from '../../common/types'
import { getFalsyValue } from '../../test/generators'
import errorBuilder, { CustomError } from './error-builder'
import errorDict from './error'

jest.spyOn(console, 'error').mockImplementation()

const loggerMock = {
  error: jest.fn(),
} as unknown as Logger

describe('errorBuilder test suite', () => {
  const validInputErrors = [errorDict.error_not_found, errorDict.unauthorized, errorDict.error_in_jwt_payload, errorDict.pim_conection_error]
  const baseError = errorDict.internal_error
  const invalidInputErrors = [
    { inputError: {} as unknown, message: `empty object` },
    { inputError: null, message: `null error` },
    { inputError: undefined, message: `undefined error` },
    {
      inputError: { ...baseError, code: getFalsyValue() },
      message: `error without code`,
    },
    // {
    //   inputError: { ...baseError, name: getFalsyValue() },
    //   message: `error without name`,
    // },
    {
      inputError: { ...baseError, code: 'FAKE_INTERNAL_CODE' },
      message: `error which code doesn't exists`,
    },
  ]

  validInputErrors.forEach((item) => {
    it(`returns formatted error - valid inputError - ${item.code}`, () => {
      const errorObject = errorBuilder(item as CustomError, loggerMock)

      expect(errorObject.name).toBe(item.name)
      expect(errorObject.message).toEqual(JSON.stringify(item))
    })
  })

  invalidInputErrors.forEach((item) => {
    it(`returns internal_error - invalid inputError - ${item.message}`, () => {
      const errorObject = errorBuilder(item.inputError as CustomError, loggerMock)

      expect(errorObject.name).toBe(baseError.name)
      expect(errorObject.message).toEqual(JSON.stringify(baseError))
    })
  })
})
