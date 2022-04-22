// import { verify } from 'njwt'
import { baseHandler } from './handler'
import { sellerTypes, PimPayload, Skus, Stock } from './common/types'
import HttpRepository from './common/httpRepository/http.repository'
import errorBuilder from './middleware/errorHandler/error-builder'
import { buildEvent, generateRandomInt } from './test/generators'

// jest.mock('njwt')
// const verifyMock = verify as jest.MockedFunction<typeof verify>

jest.mock('./common/logger/logger.service')

jest.mock('./middleware/errorHandler/error-builder')
const errorBuilderMock = errorBuilder as jest.MockedFunction<typeof errorBuilder>

const pimCheckVariantsMock = jest.spyOn(HttpRepository.prototype, 'pimCheckVariants')
// const stockHandleMock = jest.spyOn(HttpRepository.prototype, 'stockHandle')

// describe(`baseHandler test suite`, () => {
//   beforeEach(async () => {
//     jest.clearAllMocks();
//   });

//   const decodedValidJwt = {
//     body: {
//       seller_type: sellerTypes[generateRandomInt(sellerTypes.length - 2)],
//       seller_id: "FAKE_SELLER_ID",
//     },
//   };
//   const validJwt = JSON.stringify(decodedValidJwt);
//   const invalidJwt = "";
//   const jwtErrorMessage = "Invalid Jwt Error Message";
//   const event = buildEvent({ jwt: validJwt, bodySkusLength: 3 });
//   const pimSkus: Skus = {
//     sku: [
//       event.body.skus[0].sku,
//       event.body.skus[1].sku,
//       event.body.skus[2].sku,
//     ],
//   };
//   const pimPayload: PimPayload = {
//     ...pimSkus,
//     sellerId: decodedValidJwt.body.seller_id,
//   };

//   errorBuilderMock.mockImplementation(() => {
//     return new Error("FAKE_ERROR_MESSAGE");
//   });

//   verifyMock.mockImplementation((jwt) => {
//     if (jwt === invalidJwt) throw new Error(jwtErrorMessage);

//     return JSON.parse(jwt as string);
//   });

//   it(`throws an invalid JWT exception on verify`, async () => {
//     const invalidEvent = buildEvent({ jwt: invalidJwt });

//     await expect(() => baseHandler(invalidEvent)).rejects.toThrow(
//       jwtErrorMessage
//     );
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(verifyMock).toHaveBeenCalledWith(invalidJwt, process.env.JWT_SECRET);
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(pimCheckVariantsMock).not.toHaveBeenCalled();
//     expect(stockHandleMock).not.toHaveBeenCalled();
//   });

//   it(`throws an invalid JWT exception when it misses seller properties`, async () => {
//     const noSellerPropsJwt = JSON.stringify({
//       ...decodedValidJwt,
//       body: { seller_type: null, seller_id: null },
//     });
//     const invalidEvent = buildEvent({ jwt: noSellerPropsJwt });

//     await expect(() => baseHandler(invalidEvent)).rejects.toThrow();
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(verifyMock).toHaveBeenCalledWith(
//       noSellerPropsJwt,
//       process.env.JWT_SECRET
//     );
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(errorBuilderMock).toHaveBeenCalledTimes(1);
//     expect(errorBuilderMock.mock.calls[0][0]).toMatchInlineSnapshot(`
//       Object {
//         "code": "error_in_jwt_payload",
//         "message": "Invalid JWT payload",
//         "name": "error",
//         "status": 401,
//       }
//     `);

//     expect(pimCheckVariantsMock).not.toHaveBeenCalled();
//     expect(stockHandleMock).not.toHaveBeenCalled();
//   });

//   it(`throws an exception when pimCheckVariants reponds with invalid skus`, async () => {
//     const pimInvalidSkus = pimSkus;
//     pimCheckVariantsMock.mockResolvedValueOnce(pimInvalidSkus);

//     await expect(() => baseHandler(event)).rejects.toThrow();

//     expect(verifyMock).toHaveBeenCalledWith(validJwt, process.env.JWT_SECRET);
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(pimCheckVariantsMock).toHaveBeenCalledWith(
//       validJwt,
//       decodedValidJwt.body.seller_type,
//       pimPayload
//     );
//     expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1);

//     expect(errorBuilderMock).toHaveBeenCalledTimes(1);
//     expect(errorBuilderMock.mock.calls[0][0]).toMatchInlineSnapshot(`
//       Object {
//         "code": "pim_conection_error",
//         "message": "[Error in get pim ]: bad request or connection error",
//         "name": "retry",
//         "status": 500,
//       }
//     `);

//     expect(stockHandleMock).not.toHaveBeenCalled();
//   });

//   it(`throws an exception for stockHandle bad request`, async () => {
//     const errorMessage = "BAD_REQUEST";
//     pimCheckVariantsMock.mockResolvedValueOnce({ sku: [] });
//     stockHandleMock.mockRejectedValueOnce(new Error(errorMessage));

//     await expect(() => baseHandler(event)).rejects.toThrow(errorMessage);

//     expect(verifyMock).toHaveBeenCalledWith(validJwt, process.env.JWT_SECRET);
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(pimCheckVariantsMock).toHaveBeenCalledWith(
//       validJwt,
//       decodedValidJwt.body.seller_type,
//       pimPayload
//     );
//     expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1);
//   });

//   it(`success response`, async () => {
//     const stock: Stock = { stock: event.body.skus };
//     pimCheckVariantsMock.mockResolvedValueOnce({ sku: [] });
//     stockHandleMock.mockResolvedValueOnce(stock);

//     const result = await baseHandler(event);

//     expect(verifyMock).toHaveBeenCalledWith(validJwt, process.env.JWT_SECRET);
//     expect(verifyMock).toHaveBeenCalledTimes(1);

//     expect(pimCheckVariantsMock).toHaveBeenCalledWith(
//       validJwt,
//       decodedValidJwt.body.seller_type,
//       pimPayload
//     );
//     expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1);

//     expect(stockHandleMock).toHaveBeenCalledWith(
//       validJwt,
//       decodedValidJwt.body.seller_type,
//       event.body
//     );
//     expect(stockHandleMock).toHaveBeenCalledTimes(1);

//     expect(result.body).toEqual(stock);
//     expect(result.statusCode).toBe(200);
//   });
// });

describe(`baseHandler test suite`, () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  const validJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxN2EwNjNlLTMxYjAtNDdjYy04NTI5LTE3MjQyYTI1Zjc5YyIsImVtYWlsIjoiZGV2QGNlbmNvc3VkLmNsIiwiZmlyc3RfbmFtZSI6IkTDqXYiLCJsYXN0X25hbWUiOiJFaWZmZWwiLCJzZWxsZXJfaWQiOiIwN2U1ZTQ3ZS0yMWQ5LTQ3MzMtYjY3ZS1hOTFiNGRiMzU3NGQiLCJzZWxsZXJfdHlwZSI6Im11bHRpdmVuZGUiLCJpYXQiOjE2NDk3MTM1OTAsImV4cCI6MTY0OTcyNzk5MCwiaXNzIjoiRWlmZmVsLVN0ZyJ9.ENayBgs4gOJ2fgqlr--Ychnz4Y7CnPBDJkrFf77QKio'
  const validJwtPayload = {
    id: '617a063e-31b0-47cc-8529-17242a25f79c',
    email: 'dev@cencosud.cl',
    first_name: 'Dév',
    last_name: 'Eiffel',
    seller_id: '07e5e47e-21d9-4733-b67e-a91b4db3574d',
    seller_type: 'multivende',
    iat: 1649713590,
    exp: 1649727990,
    iss: 'Eiffel-Stg',
  }
  const invalidJwt = ''
  const jwtErrorMessage = 'Invalid Jwt Error Message'
  const event = buildEvent({ jwt: validJwt, bodySkusLength: 3 })
  const pimPayload: PimPayload = {
    sku: [event.body.skus[0].sku, event.body.skus[1].sku, event.body.skus[2].sku],
    sellerId: validJwtPayload.seller_id,
  }

  errorBuilderMock.mockImplementation(() => {
    return new Error(jwtErrorMessage)
  })

  it(`throws an invalid JWT exception when it misses seller properties`, async () => {
    const invalidEvent = buildEvent({ jwt: invalidJwt })

    await expect(() => baseHandler(invalidEvent)).rejects.toThrow(jwtErrorMessage)

    expect(errorBuilderMock).toHaveBeenCalledTimes(1)
    expect(errorBuilderMock.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "code": "error_in_jwt_payload",
        "message": "Invalid JWT payload",
        "name": "error",
        "status": 401,
      }
    `)

    expect(pimCheckVariantsMock).not.toHaveBeenCalled()
  })

  it(`set quantity (stock) zero for invalid skus`, async () => {
    const pimInvalidSkus = { sku: [event.body.skus[0].sku] }
    pimCheckVariantsMock.mockResolvedValueOnce(pimInvalidSkus)

    const invalidItems = [{ ...event.body.skus[0], quantity: 0 }] // REGLA DE NEGOCIO: los sku invalidos se graban con stock = 0
    const validItems = [event.body.skus[1], event.body.skus[2]]
    const responseBody = {
      sellerId: validJwtPayload.seller_id,
      skus: [...invalidItems, ...validItems],
    }

    const response = await baseHandler(event)

    expect(response.body).toEqual(responseBody)
    expect(response.statusCode).toBe(200)

    expect(pimCheckVariantsMock).toHaveBeenCalledWith(validJwt, validJwtPayload.seller_type, pimPayload)
    expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1)
  })

  it(`throws an exception for pimCheckVariants unauthorized request`, async () => {
    const expiredJwt = validJwt
    const errorMessage = 'Request failed with status code 401'
    pimCheckVariantsMock.mockRejectedValueOnce(new Error(errorMessage))

    await expect(() => baseHandler(event)).rejects.toThrow(errorMessage)

    expect(pimCheckVariantsMock).toHaveBeenCalledWith(expiredJwt, validJwtPayload.seller_type, pimPayload)
    expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1)
  })

  it(`success response without invalid skus`, async () => {
    const invalidSkus = [] as string[]
    pimCheckVariantsMock.mockResolvedValueOnce({ sku: invalidSkus })

    const validItems = event.body.skus
    const responseBody = {
      sellerId: validJwtPayload.seller_id,
      skus: validItems,
    }

    const response = await baseHandler(event)

    expect(response.body).toEqual(responseBody)
    expect(response.statusCode).toBe(200)

    expect(pimCheckVariantsMock).toHaveBeenCalledWith(validJwt, validJwtPayload.seller_type, pimPayload)
    expect(pimCheckVariantsMock).toHaveBeenCalledTimes(1)
  })
})
