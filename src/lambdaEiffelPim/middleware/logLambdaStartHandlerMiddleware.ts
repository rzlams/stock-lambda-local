
import middy from '@middy/core';
import MiddlewareFunction = middy.MiddlewareFn;

const defaults = {
    logger: console
  }

export const LogLambdaStartMiddleware = (opts: {} = {}) => {
  const options = { ...defaults, ...opts }

  const before: MiddlewareFunction<any, any> = async (request) => {
    try {
        let requestLog:any;
        if (typeof(request) === 'string') {
          requestLog = JSON.parse(request);
        } else {
          requestLog = request;
        };
        options.logger.log(requestLog);
        return;
    } catch(error) {
        options.logger.error(error);
        return;
    }
  }

  return {
    before
  };
}