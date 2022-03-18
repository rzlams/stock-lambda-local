import * as LogHandlerMiddleware from './logLambdaStartHandlerMiddleware';
import middy from '@middy/core';
import MiddlewareFunction = middy.MiddlewareFn;
import mockedRequest from './../__mocks__/request.mock';

jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe('LogLambdaStartHandlerMiddleware', () => {
  
  let middleware: any

  beforeAll(async () => {
    middleware = await LogHandlerMiddleware.LogLambdaStartMiddleware();
  });

  it('should LogLambdaStartMiddleware return undefined with a request as an object', async () => {
    expect.assertions(1);
    const output = await middleware.before(mockedRequest as any) 
    expect(output).toBe(undefined);
  });
    
  it('should LogLambdaStartMiddleware return undefined with a request as a string', async () => {
    expect.assertions(1);
    const output = await middleware.before(JSON.stringify(mockedRequest) as any)
    expect(output).toBe(undefined);
  });

  it('should LogLambdaStartMiddleware return undefined when catch error', async () => {
    expect.assertions(1);
    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('Error')
    });
    const output = await middleware.before(JSON.stringify(mockedRequest) as any)
    expect(output).toBe(undefined);
  });

});