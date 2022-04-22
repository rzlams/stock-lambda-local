import middy from '@middy/core'
import MiddlewareFunction = middy.MiddlewareFn

const defaults = {
  logger: console,
}

const LogLambdaStartMiddleware = (opts: Record<string, unknown> = {}) => {
  const options = { ...defaults, ...opts }

  const before: MiddlewareFunction<unknown, unknown> = async (request) => {
    try {
      const requestLog = typeof request === 'string' ? JSON.parse(request) : request

      options.logger.log(requestLog)
      return
    } catch (error) {
      options.logger.error(error)
      return
    }
  }

  return { before }
}

export default LogLambdaStartMiddleware
