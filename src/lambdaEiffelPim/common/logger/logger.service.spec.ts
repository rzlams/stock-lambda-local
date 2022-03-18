import { LoggerService } from './logger.service'
import * as Winston from 'winston'

const info: jest.Mock = jest.fn()
const error: jest.Mock = jest.fn()
const warn: jest.Mock = jest.fn()
const debug: jest.Mock = jest.fn()
const verbose: jest.Mock = jest.fn()

jest.mock('winston', () => {
  const actualModule = jest.requireActual('winston')

  return {
    ...actualModule,
    createLogger: () => ({
      info,
      error,
      warn,
      debug,
      verbose,
    }),
  }
})

jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('LoggerService', () => {
  let loggerService: LoggerService

  beforeEach(async () => {
    jest.resetAllMocks()
    loggerService = new LoggerService()
  })

  it('logger.info should be called', () => {
    loggerService.log('info test message')
    expect(info).toBeCalledTimes(1)
  })
  it('logger.error should be called', () => {
    loggerService.error('error test message')
    expect(error).toBeCalledTimes(1)
  })
  it('logger.warn should be called', () => {
    loggerService.warn('warn test message')
    expect(warn).toBeCalledTimes(1)
  })
  it('logger.debug should be called', () => {
    loggerService.debug('debug test message')
    expect(debug).toBeCalledTimes(1)
  })
  it('logger.verbose should be called', () => {
    loggerService.verbose('verbose test message')
    expect(verbose).toBeCalledTimes(1)
  })
})
