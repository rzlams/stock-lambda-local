import middy from '@middy/core'
import MiddlewareFunction = middy.MiddlewareFn
import errorDict from './error'
import errorBuilder, { CustomError } from './error-builder'
import { Logger } from '../../common/types'

const defaults = {
  logger: console,
  errorDict,
}

const ErrorHandlerMiddleware = (opts: Record<string, unknown> = {}) => {
  const options = { ...defaults, ...opts }

  const onError: MiddlewareFunction<unknown> = (request) => {
    options.logger.error('error_handler_request', request)
    if (!request.hasOwnProperty('error')) {
      options.logger.error('error not found', request)
      throw errorBuilder(defaults.errorDict.error_not_found, options.logger as Logger)
    }

    throw errorBuilder(request.error as CustomError, options.logger as Logger)
  }

  return {
    onError,
  }
}

export default ErrorHandlerMiddleware
