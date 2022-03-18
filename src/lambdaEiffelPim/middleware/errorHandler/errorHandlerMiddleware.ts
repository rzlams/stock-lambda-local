import middy from '@middy/core'
import MiddlewareFunction = middy.MiddlewareFn
import errorDict from './error.json'
import { errorBuilder } from './error-builder'

const defaults = {
  logger: console,
  errorDict: errorDict,
}

export const ErrorHandlerMiddleware = (opts: {} = {}) => {
  const options = { ...defaults, ...opts }

  const onError: MiddlewareFunction<any, any> = (request) => {
    options.logger.error({ error_handler_request: request })
    if (!request.hasOwnProperty('error')) {
      options.logger.error('error not found', request)
      throw errorBuilder(defaults.errorDict.error_not_found, options.logger)
    }
    throw errorBuilder(request.error, options.logger)
  }

  return {
    onError,
  }
}
