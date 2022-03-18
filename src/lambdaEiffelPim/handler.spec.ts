import { baseHandler, validateRequestBody, transformRequestBody } from './handler'
import { Event, StockItem, sellerTypes, StockSkus } from './common/types'
import config from './config'
import { verify } from 'njwt'
import { httpRepository } from './common/http.repository'

jest.mock('njwt')
const verifyMock = verify as jest.MockedFunction<typeof verify>

jest.mock('./common/http.repository')
const pimCheckVariantsMock = httpRepository.pimCheckVariants as jest.MockedFunction<typeof httpRepository.pimCheckVariants>
const stockHandleMock = httpRepository.stockHandle as jest.MockedFunction<typeof httpRepository.stockHandle>

describe(`validateRequestBody only allows some payloads as input`, () => {
  const invalidSku = { sku: '', quantity: generateRandomInt() }
  const invalidQtySku = {
    sku: buildSku(),
    quantity: generateRandomInt() > 5 ? undefined : -1,
  }
  const validSku = { sku: buildSku(), quantity: generateRandomInt() }
  const invalidLength = config.maxSkusLength + 1 + generateRandomInt()
  const invalidLengthSkus = Array(invalidLength).fill(validSku)
  const validPayload = buildRequestBody()
  const invalidPayloads = [
    { body: {} as any, error: `empty body` },
    { body: { skus: null } as any, error: `skus is null` },
    { body: { skus: [] }, error: `skus is empty array` },
    {
      body: { skus: invalidLengthSkus },
      error: `skus length (${invalidLength}) is larger than max length (${config.maxSkusLength})`,
    },
    {
      body: buildRequestBody({ skusAdded: [invalidSku] }),
      error: `invalid sku - ${JSON.stringify(invalidSku)}`,
    },
    {
      body: buildRequestBody({ skusAdded: [invalidQtySku] }),
      error: `invalid quantity - ${JSON.stringify(invalidQtySku)}`,
    },
  ]

  it(`valid payload`, () => {
    expect(validateRequestBody(validPayload)).toEqual(validPayload)
  })

  invalidPayloads.forEach((item, index) => {
    test(`invalid payload - ${item.error}`, () => {
      expect(() => validateRequestBody(item.body)).toThrow()
    })
  })
})

describe(`transformRequestBody returns formatted body (typeof Stock)`, () => {
  const formattedPayload = buildRequestBody()
  const duplicateSkusPayload = {
    skus: [...formattedPayload.skus, formattedPayload.skus[0]],
  }

  const payloads = [
    { title: 'already formatted', payload: formattedPayload },
    { title: 'duplicate skus', payload: duplicateSkusPayload },
  ]

  payloads.forEach((item) => {
    it(`format payload - ${item.title}`, () => {
      expect(transformRequestBody(item.payload)).toEqual(formattedPayload)
    })
  })
})

describe(`baseHandler test suite`, () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  const decodedJwt = {
    body: {
      seller_type: sellerTypes[generateRandomInt(sellerTypes.length - 1)],
    },
  }
  const validJwt = 'VALID_JWT'
  const invalidJwt = 'INVALID_JWT'
  const jwtErrorMessage = 'Invalid Jwt'
  const event = buildEvent({ jwt: validJwt, bodySkusLength: 3 })
  const skus = {
    sku: [event.body.skus[0], event.body.skus[1], event.body.skus[2]],
  }
  const pimSkus = { sku: [skus.sku[0].sku, skus.sku[1].sku, skus.sku[2].sku] }

  verifyMock.mockImplementation((jwt) => {
    if (jwt === invalidJwt) throw new Error(jwtErrorMessage)

    return decodedJwt as any
  })

  it(`throws an invalid JWT exception`, async () => {
    const invalidEvent = buildEvent({ jwt: invalidJwt })

    await expect(() => baseHandler(invalidEvent)).rejects.toThrow(jwtErrorMessage)
    expect(verifyMock).toHaveBeenCalledTimes(1)

    expect(verifyMock).toHaveBeenCalledWith(invalidJwt, process.env.JWT_SECRET)
    expect(verifyMock).toHaveBeenCalledTimes(1)

    expect(pimCheckVariantsMock).not.toHaveBeenCalled()
    expect(stockHandleMock).not.toHaveBeenCalled()
  })

  it(`throws an exception when pimCheckVariants reponds with invalid skus`, async () => {
    const pimInvalidSkus = pimSkus
    pimCheckVariantsMock.mockResolvedValueOnce(pimInvalidSkus)

    await expect(() => baseHandler(event)).rejects.toThrow()

    expect(verifyMock).toHaveBeenCalledWith(validJwt, process.env.JWT_SECRET)
    expect(verifyMock).toHaveBeenCalledTimes(1)

    expect(pimCheckVariantsMock).toHaveBeenCalledWith(validJwt, decodedJwt.body.seller_type, pimSkus)
    expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1)

    expect(stockHandleMock).not.toHaveBeenCalled()
  })

  it(`throws an exception for stockHandle bad request`, async () => {
    const errorMessage = 'BAD_REQUEST'
    pimCheckVariantsMock.mockResolvedValueOnce({ sku: [] })
    stockHandleMock.mockRejectedValueOnce(new Error(errorMessage))

    await expect(() => baseHandler(event)).rejects.toThrow(errorMessage)

    expect(verifyMock).toHaveBeenCalledWith(validJwt, process.env.JWT_SECRET)
    expect(verifyMock).toHaveBeenCalledTimes(1)

    expect(pimCheckVariantsMock).toHaveBeenCalledWith(validJwt, decodedJwt.body.seller_type, pimSkus)
    expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1)
  })

  it(`success response`, async () => {
    // Respuesta del stockHandle
    const stock = {}
    pimCheckVariantsMock.mockResolvedValueOnce({ sku: [] })
    stockHandleMock.mockResolvedValueOnce(stock)

    const result = await baseHandler(event)

    expect(verifyMock).toHaveBeenCalledWith(validJwt, process.env.JWT_SECRET)
    expect(verifyMock).toHaveBeenCalledTimes(1)

    expect(pimCheckVariantsMock).toHaveBeenCalledWith(validJwt, decodedJwt.body.seller_type, pimSkus)
    expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1)

    expect(stockHandleMock).toHaveBeenCalledWith(validJwt, decodedJwt.body.seller_type, event.body)
    expect(stockHandleMock).toHaveBeenCalledTimes(1)

    expect(result.body).toEqual(stock)
    expect(result.statusCode).toBe(200)
  })
})

function generateRandomInt(maxNumber = 10) {
  return Math.floor(Math.random() * maxNumber)
}

function buildSku() {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result + '-' + generateRandomInt()
}

function buildRequestBody({ skusAdded = [] as any[], skusLength = generateRandomInt(config.maxSkusLength) } = {}): StockSkus {
  const skus = [] as StockItem[]
  const resultLength = skusLength === 0 ? 1 : skusLength

  for (var i = 0; i < resultLength; i++) {
    const newItem = { sku: buildSku(), quantity: generateRandomInt() }
    const isDuplicate = skus.some((item) => item.sku === newItem.sku)

    if (isDuplicate) continue

    skus.push(newItem)
  }

  return { skus: [...skus, ...skusAdded] }
}

function buildEvent({ jwt = 'JSON_WEB_TOKEN', bodySkusLength = 3 as any, ...overrides } = {}): Event {
  return {
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    body: buildRequestBody({ skusLength: bodySkusLength }),
    ...overrides,
  }
}
