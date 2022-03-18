import { errorBuilder } from './error-builder'
import errorDict from './error.json'

jest.spyOn(console, 'log').mockImplementation(() => {})

describe('ErrorBuilderSpec', () => {
  const logger = {
    error: jest.fn(),
    log: jest.fn(),
  }

  it('should return an error with inputError empty', () => {
    expect.assertions(2)
    const result = errorBuilder(null, logger)
    expect(typeof result).toBe('object')
    expect(result instanceof Error).toBe(true)
  })

  it('should call the logger error function 1 time', () => {
    errorBuilder(null, logger)
    expect(logger.error).toBeCalledTimes(1)
  })

  it('should call the logger error function 2 times and the log function 1', () => {
    expect.assertions(2)
    errorBuilder(errorDict?.internal_error, logger)
    expect(logger.error).toBeCalledTimes(2)
    expect(logger.log).toBeCalledTimes(1)
  })

  it('should return an bulk_insert_error', () => {
    expect.assertions(1)
    const result = errorBuilder(errorDict?.bulk_insert_error, logger)
    expect(result.message).toBe(JSON.stringify(errorDict?.bulk_insert_error))
  })

  it('should return an internal error', () => {
    expect.assertions(2)
    const emptyParamResult = errorBuilder(null, logger)
    expect(emptyParamResult.message).toBe(JSON.stringify(errorDict?.internal_error))
    const withParamResult = errorBuilder(
      {
        name: 'test',
        status: 500,
        message: 'test message',
      },
      logger
    )
    expect(withParamResult.message).toBe(JSON.stringify(errorDict?.internal_error))
  })
})
