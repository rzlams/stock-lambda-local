import errorDict from './error'
import { Logger } from '../../common/types'

type InternalCode = keyof typeof errorDict
export type CustomError = typeof errorDict[InternalCode]

function getError(inputError: CustomError) {
  const internalCode = inputError?.code as InternalCode

  if (!inputError?.name || !errorDict[internalCode]) return errorDict.internal_error

  return inputError as CustomError
}

const errorBuilder = (inputError: CustomError, logger = console as Logger): Error => {
  logger.error('error_handler_request', inputError)

  const error = getError(inputError)

  logger.error('error_handler_response', error)

  const newError = new Error()
  newError.name = error.name
  newError.message = JSON.stringify(error)

  return newError
}

export default errorBuilder
