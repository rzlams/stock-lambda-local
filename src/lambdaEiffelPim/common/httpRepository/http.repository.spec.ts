/* eslint no-underscore-dangle: 0 */
import Axios, { AxiosStatic } from "axios";
import HttpRepository from "./http.repository";
import { sellerTypes, Skus, Stock, Logger } from "../types";
import { buildSku, buildStockSkus } from "../../test/generators";

let postMethodMock = jest.fn();

jest.mock("axios", () => {
  return {
    __setPostMethodReturnValue: (value: unknown) => {
      postMethodMock = jest.fn(() => {
        if (value instanceof Error) throw value;
        return { data: value };
      });
    },
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      post: postMethodMock,
    })),
  };
});
const axiosMock = Axios as jest.Mocked<
  AxiosStatic & { __setPostMethodReturnValue: jest.Mock }
>;

const loggerMock = {
  debug: jest.fn(),
  error: jest.fn(),
} as unknown as Logger;

describe("httpRepository test suite", () => {
  const httpRepository = new HttpRepository(loggerMock);
  const jwt = "FAKE_JSON_WEB_TOKEN";
  const sellerType = sellerTypes[0];
  const pimPayload = {
    sku: [buildSku(), buildSku(), buildSku()],
    sellerId: "FAKE_SELLER_ID",
  };
  const stockSkus = buildStockSkus();
  const errorMessage = "FAKE_RROR_MESSAGE";

  beforeAll(() => {
    process.env.DEBUG = "true";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.DEBUG = undefined;
  });

  it("pimCheckVariants returns a valid response", async () => {
    const pimCheckVariantsResponseData: Skus = { sku: [] };

    axiosMock.__setPostMethodReturnValue(pimCheckVariantsResponseData);

    const result = await httpRepository.pimCheckVariants(
      jwt,
      sellerType,
      pimPayload
    );

    expect(axiosMock.create.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "baseURL": "https://pim-back.aws-test.paris.cl",
          "headers": Object {
            "Authorization": "Bearer FAKE_JSON_WEB_TOKEN",
            "Content-Type": "application/json",
            "Origin": "multivende",
          },
        },
      ]
    `);
    expect(result).toEqual(pimCheckVariantsResponseData);

    expect(postMethodMock).toHaveBeenCalledTimes(1);
    expect(postMethodMock).toHaveBeenCalledWith(
      process.env.PIM_CHECK_VARIANTS_PATH,
      pimPayload
    );
  });

  it("pimCheckVariants throws an exception", async () => {
    axiosMock.__setPostMethodReturnValue(new Error(errorMessage));

    await expect(() =>
      httpRepository.pimCheckVariants(jwt, sellerType, pimPayload)
    ).rejects.toThrow();

    expect(postMethodMock).toHaveBeenCalledTimes(1);
  });

  it("stockHandle returns a valid response", async () => {
    const stockHandleResponseData: Stock = { stock: stockSkus.skus };

    axiosMock.__setPostMethodReturnValue(stockHandleResponseData);

    const result = await httpRepository.stockHandle(jwt, sellerType, stockSkus);

    expect(axiosMock.create.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "baseURL": "https://eiffel-monorepo-stock.aws-test.paris.cl",
          "headers": Object {
            "Authorization": "Bearer FAKE_JSON_WEB_TOKEN",
            "Content-Type": "application/json",
            "Origin": "multivende",
          },
        },
      ]
    `);
    expect(result).toEqual(stockHandleResponseData);

    expect(postMethodMock).toHaveBeenCalledTimes(1);
    expect(postMethodMock).toHaveBeenCalledWith(
      process.env.STOCK_HANDLE_PATH,
      stockSkus
    );
  });

  it("stockHandle throws an exception", async () => {
    axiosMock.__setPostMethodReturnValue(new Error(errorMessage));

    await expect(() =>
      httpRepository.stockHandle(jwt, sellerType, stockSkus)
    ).rejects.toThrow();

    expect(postMethodMock).toHaveBeenCalledTimes(1);
  });
});
