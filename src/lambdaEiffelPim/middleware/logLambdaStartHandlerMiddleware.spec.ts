import LogLambdaStartMiddleware from './logLambdaStartHandlerMiddleware'
import mockedRequest from '../__mocks__/request.mock'

const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()

describe('LogLambdaStartHandlerMiddleware', () => {
  it('should LogLambdaStartMiddleware return undefined with a request as an object', async () => {
    expect.assertions(3)
    const output = await LogLambdaStartMiddleware().before(
      mockedRequest as any // eslint-disable-line
    )
    expect(output).toBe(undefined)

    expect(consoleLogMock).toBeCalledTimes(1)
    expect(consoleLogMock).toHaveBeenCalledWith(mockedRequest)
  })

  it('should LogLambdaStartMiddleware return undefined with a request as a string', async () => {
    expect.assertions(3)
    const output = await LogLambdaStartMiddleware().before(
      JSON.stringify(mockedRequest) as any // eslint-disable-line
    )
    expect(output).toBe(undefined)

    expect(consoleLogMock).toBeCalledTimes(1)
    expect(consoleLogMock).toHaveBeenCalledWith(mockedRequest)
  })

  it('should LogLambdaStartMiddleware return undefined when catch error', async () => {
    expect.assertions(3)
    const errorMessage = 'Error'

    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error(errorMessage)
    })
    const output = await LogLambdaStartMiddleware().before(
      JSON.stringify(mockedRequest) as any // eslint-disable-line
    )
    expect(output).toBe(undefined)

    expect(consoleErrorMock).toBeCalledTimes(1)
    expect(consoleErrorMock).toHaveBeenCalledWith(new Error(errorMessage))
  })
})
