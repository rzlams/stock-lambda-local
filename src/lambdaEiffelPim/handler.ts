// libs
import middy from '@middy/core'
// import { JwtBody, verify } from 'njwt'
// middlewares
import LoggerService from './common/logger/logger.service'
import LogLambdaStartMiddleware from './middleware/logLambdaStartHandlerMiddleware'
import ErrorHandlerMiddleware from './middleware/errorHandler/errorHandlerMiddleware'
import errorBuilder from './middleware/errorHandler/error-builder'
import errorDict from './middleware/errorHandler/error'
// others
import HttpRepository from './common/httpRepository/http.repository'
import { Event, SellerType, Skus } from './common/types'
import { validateRequestBody, transformRequestBody } from './common/requestDTOs/requestDTOs'
import { getJwtBody } from './common/getJwtBody'

const logger = new LoggerService()
const http = new HttpRepository(logger)
const pjson = { version: 1, name: 'lambda' } // const pjson = require('../../packaje.json')

// type JwtBodyWithSeller = JwtBody & {
//   seller_type: SellerType
//   seller_id: string
// }
type JwtBody = {
  id: string
  email: string
  first_name: string
  last_name: string
  iat: number
  exp: number
  iss: string
  seller_type: SellerType
  seller_id: string | null
}

export const baseHandler = async (rawEvent: unknown, context = {} as unknown) => {
  const event = rawEvent as Event
  const lambda = {
    name: pjson.name,
    version: pjson.version,
  }

  logger.log('lambda ', { name: lambda.name, version: lambda.version })

  try {
    const validatedBody = validateRequestBody(event.body)
    const body = transformRequestBody(validatedBody)

    const authHeader = event.headers?.authorization
    const hasBearerToken = typeof authHeader === 'string' && authHeader.trim().indexOf('Bearer ') === 0
    const jwt = hasBearerToken ? authHeader.trim().substring(7) : ''

    // const verifiedJwt = verify(jwt, process.env.JWT_SECRET)

    // logearse en marketplace staging para obtener el jwt
    // const jwtPayloadAAA = verifiedJwt && (verifiedJwt.body as JwtBodyWithSeller)
    // const jwtPayload = { ...jwtPayloadAAA, seller_type: 'multivende' as SellerType, seller_id: '07e5e47e-21d9-4733-b67e-a91b4db3574d' }
    // const jwtPayload = verifiedJwt && (verifiedJwt.body as JwtBodyWithSeller)
    const jwtPayload: JwtBody = getJwtBody(jwt)

    if (!jwtPayload?.seller_id || !jwtPayload?.seller_type) throw errorBuilder(errorDict.error_in_jwt_payload, logger)

    const incomingSkus: Skus = { sku: body.skus.map((s) => s.sku) }
    const pimPayload = { ...incomingSkus, sellerId: jwtPayload.seller_id }
    // preguntar que hace el checkVariants en el PIM porque luego en el monorepo repite el mismo proceso que aca
    // verifica el jwt, arma un objeto con un array de skus y consulta el PIM
    // tal vez este llamado al PIM este de mas si igual lo hace de nuevo en el monorepo

    const invalidSkus = await http.pimCheckVariants(jwt, jwtPayload.seller_type, pimPayload)

    // if (invalidSkus?.sku?.length > 0) throw errorBuilder(errorDict.pim_conection_error, logger)
    // aca da error porque en el monorepo hace el mismo llamado que en el http.pimCheckVariants de aqui
    // aca tengo hardcoded el seller_id del jwt pero en el token que envio no va esa informacion
    // const stock = await http.stockHandle(jwt, jwtPayload.seller_type, body)

    const validSkus = body.skus.map((item) => {
      const isInvalid = invalidSkus?.sku?.some((invalidSku) => invalidSku === item.sku)

      if (isInvalid) return { ...item, quantity: 0 }

      return item
    })

    const responseBody = {
      sellerId: jwtPayload.seller_id,
      skus: validSkus,
    }

    return {
      metadata: lambda,
      statusCode: 200,
      body: responseBody,
    }
  } catch (error) {
    logger.error(lambda.name, error)
    throw error
  }
}

export const handler = middy(baseHandler).use(LogLambdaStartMiddleware({ logger })).use(ErrorHandlerMiddleware({ logger }))

///////////////////////////////////////////////////////////////////////
// CODIGO EXPRESS
///////////////////////////////////////////////////////////////////////
export const lambdaEiffelPim = async (req: any, res: any, next: any) => {
  try {
    const response = await handler(req, res)
    res.json(response)
  } catch (error) {
    next(error)
  }
}
///////////////////////////////////////////////////////////////////////
