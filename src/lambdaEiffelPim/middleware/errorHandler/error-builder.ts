import { CustomError } from './error.dto'
import errorDict from './error.json'

export const errorBuilder = (inputError: any, logger: any): Error => {
  let error: CustomError = errorDict.internal_error

  if (inputError) {
    logger.error({ error_handler_request: inputError })

    let internalCode: keyof typeof errorDict = inputError.code

    logger.log(internalCode, errorDict[internalCode])

    if (!errorDict[internalCode]) {
      error = { ...errorDict.internal_error }
    } else {
      error = { ...inputError }
    }
  }

  logger.error({ error_handler_response: error })

  let newError = new Error()

  newError.name = error.name
  newError.message = JSON.stringify(error)

  return newError
}
