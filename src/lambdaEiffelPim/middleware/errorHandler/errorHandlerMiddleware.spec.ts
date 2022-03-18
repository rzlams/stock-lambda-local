import * as ErrorHandlerMiddleware from './errorHandlerMiddleware'
import mockedRequest from '../../__mocks__/request.mock'
import errorDict from './error.json'

jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('ErrorHandlerMiddlewareSpec', () => {
  let middleware: any
  const mockedRequestWithError: any = {
    ...mockedRequest,
    error: {
      name: 'mocked Error',
      message: 'mocked Error',
      status: 404,
    },
  }

  beforeAll(() => {
    middleware = ErrorHandlerMiddleware.ErrorHandlerMiddleware()
  })

  it('should ErrorHandlerMiddleware throw a retry error', () => {
    const retryError = new Error('retryError')
    retryError.name = 'retry'
    retryError.message = JSON.stringify(errorDict?.error_not_found)
    expect(() => {
      middleware.onError(mockedRequest as any)
    }).toThrow(retryError)
  })
  it('should ErrorHandlerMiddleware throw an internal error', () => {
    const internalError = new Error(JSON.stringify(errorDict?.internal_error))
    expect(() => {
      middleware.onError(mockedRequestWithError as any)
    }).toThrow(internalError)
  })
  it('should ErrorHandlerMiddleware throw a mocked error', () => {
    mockedRequestWithError.error.code = errorDict?.error_not_found?.code
    const mockedError = new Error(JSON.stringify(mockedRequestWithError?.error))
    expect(() => {
      middleware.onError(mockedRequestWithError as any)
    }).toThrowError(mockedError)
  })
})
