import ErrorHandlerMiddleware from './errorHandlerMiddleware'
import mockedRequest from '../../__mocks__/request.mock'
import errorBuilder from './error-builder'
import errorDict from './error'

jest.spyOn(console, 'error').mockImplementation()
jest.mock('./error-builder')
const errorBuilderMock = errorBuilder as jest.MockedFunction<typeof errorBuilder>

describe('ErrorHandlerMiddlewareSpec', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should ErrorHandlerMiddleware throws an error_not_found error', () => {
    const notFoundError = JSON.stringify(errorDict.error_not_found)
    errorBuilderMock.mockReturnValueOnce(new Error(notFoundError))

    expect(() => {
      ErrorHandlerMiddleware().onError(mockedRequest as any) // eslint-disable-line
    }).toThrow(notFoundError)

    expect(errorBuilderMock).toBeCalledTimes(1)
  })

  it('should ErrorHandlerMiddleware throws the request error', () => {
    const mockedRequestWithError = {
      ...mockedRequest,
      error: {
        name: 'mocked Error',
        message: 'mocked Error',
        status: 404,
        code: 'mocked code',
      },
    }
    const mockedError = JSON.stringify(mockedRequestWithError.error)
    errorBuilderMock.mockReturnValueOnce(new Error(mockedError))

    expect(() => {
      ErrorHandlerMiddleware().onError(mockedRequestWithError as any) // eslint-disable-line
    }).toThrowError(mockedError)

    expect(errorBuilderMock).toBeCalledTimes(1)
    expect(errorBuilderMock.mock.calls[0][0]).toEqual(mockedRequestWithError.error)
  })
})
