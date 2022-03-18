// libs
import middy from '@middy/core'
import { JwtBody, verify } from 'njwt'
// middlewares
import { LoggerService } from './common/logger/logger.service'
import { LogLambdaStartMiddleware } from './middleware/logLambdaStartHandlerMiddleware'
import { ErrorHandlerMiddleware } from './middleware/errorHandler/errorHandlerMiddleware'
import { errorBuilder } from './middleware/errorHandler/error-builder'
import errorDict from './middleware/errorHandler/error.json'
// others
import { httpRepository } from './common/http.repository'
import { Event, StockItem, StockSkus, SellerType, Skus } from './common/types'
import config from './config'

const logger = new LoggerService()
const pjson = { version: 1, name: 'lambda' } // const pjson = require('../../packaje.json')

type JwtBodyWithSellerType = JwtBody & { seller_type: SellerType }

export const baseHandler = async (event: Event, context = {} as any) => {
  const lambda = {
    name: pjson.name,
    version: pjson.version,
  }

  logger.log('lambda ', { name: lambda.name, version: lambda.version })

  try {
    const validatedBody = validateRequestBody(event.body)
    const body = transformRequestBody(validatedBody)

    const authHeader = event.headers?.authorization
    const jwt = typeof authHeader === 'string' && authHeader.trim().indexOf('Bearer ') === 0 ? authHeader.trim().substring(7) : ''

    const verifiedJwt = verify(jwt, process.env.JWT_SECRET)
    // const jwtPayloadAAA = verifiedJwt && (verifiedJwt.body as JwtBodyWithSellerType)
    // const jwtPayload = { ...jwtPayloadAAA, seller_type: 'multivende' as SellerType, seller_id: '927c9f96-b716-4d1b-b1f7-b5c3542e7f42' }
    const jwtPayload = verifiedJwt && (verifiedJwt.body as JwtBodyWithSellerType)
    const sellerType = jwtPayload ? jwtPayload.seller_type : null

    const incomingSkus: Skus = { sku: body.skus.map((s) => s.sku) }
    // preguntar que hace el checkVariants en el PIM porque luego en el monorepo repite el mismo proceso que aca
    // verifica el jwt, arma un objeto con un array de skus y consulta el PIM
    // tal vez este llamado al PIM este de mas si igual lo hace de nuevo en el monorepo

    const invalidSkus = await httpRepository.pimCheckVariants(jwt, sellerType, incomingSkus)

    if (invalidSkus?.sku?.length > 0) throw errorBuilder(errorDict.pim_conection_error, logger)

    const stock = await httpRepository.stockHandle(jwt, sellerType, body)

    return {
      metadata: lambda,
      statusCode: 200,
      body: stock,
    }
  } catch (error) {
    logger.error(error as any)
    throw error
  }
}

const eiffelPim = middy(baseHandler)
  // .use(LogLambdaStartMiddleware({ logger: logger }))
  .use(ErrorHandlerMiddleware({ logger: logger }))

// Esto puede ser un middleware.
// Evaluar hacer un middleware generico que pueda recibir las validaciones como options
// Pasar las validaciones como { body, query, params } y dentro del md correr de manera condicional solo los que se reciben
// Proponer usar Joi para esto
export function validateRequestBody(body: StockSkus) {
  if (body?.skus === undefined) throw new Error('The key skus is required')
  if (!Array.isArray(body?.skus)) throw new Error('The key skus must be an array')
  if (body?.skus?.length === 0) throw new Error(`The key skus mustn't be an empty array`)
  if (body?.skus?.length > config.maxSkusLength) throw new Error(`The max length of skus is ${config.maxSkusLength}`)

  const invalidItem = body?.skus?.find((v) => !v.sku || isNaN(Number(v.quantity)) || Number(v.quantity) < 0)
  if (invalidItem) throw new Error(`All skus must be an instance of StockItem - Invalid Sku: ${invalidItem.sku}`)

  return body
}

export function transformRequestBody(body: StockSkus) {
  // format items and remove duplicates
  const formattedSkus = body.skus.reduce((acc, item) => {
    const isDuplicate = acc.some((accItem) => accItem.sku === item.sku)

    if (isDuplicate) return acc

    const formattedItem = {
      sku: String(item.sku),
      quantity: Number(item.quantity),
    }

    return [...acc, formattedItem]
  }, [] as StockItem[])

  return { skus: formattedSkus }
}

///////////////////////////////////////////////////////////////////////
// CODIGO EXPRESS
///////////////////////////////////////////////////////////////////////
export const handler = async (req: any, res: any) => {
  const response = await eiffelPim(req, res)

  res.json(response)
}
///////////////////////////////////////////////////////////////////////
