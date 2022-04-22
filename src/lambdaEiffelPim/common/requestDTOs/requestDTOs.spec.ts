import { validateRequestBody, transformRequestBody } from "./requestDTOs";
import {
  buildSku,
  buildRequestBody,
  generateRandomInt,
} from "../../test/generators";
import config from "../../config";

describe(`validateRequestBody only allows some payloads as input`, () => {
  const invalidSku = { sku: "", quantity: generateRandomInt() };
  const invalidQtySku = {
    sku: buildSku(),
    quantity: generateRandomInt() > 5 ? undefined : -1,
  };
  const validSku = { sku: buildSku(), quantity: generateRandomInt() };
  const invalidLength = config.maxSkusLength + 1 + generateRandomInt();
  const invalidLengthSkus = Array(invalidLength).fill(validSku);
  const validPayload = buildRequestBody();
  const invalidPayloads = [
    { body: {}, error: `empty body` },
    { body: { skus: null }, error: `skus is null` },
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
  ];

  it(`valid payload`, () => {
    expect(validateRequestBody(validPayload)).toEqual(validPayload);
  });

  invalidPayloads.forEach((item) => {
    test(`invalid payload - ${item.error}`, () => {
      expect(() => validateRequestBody(item.body)).toThrow();
    });
  });
});

describe(`transformRequestBody returns formatted body (typeof Stock)`, () => {
  const formattedPayload = buildRequestBody();
  const duplicateSkusPayload = {
    skus: [...formattedPayload.skus, formattedPayload.skus[0]],
  };

  const payloads = [
    { title: "already formatted", payload: formattedPayload },
    { title: "duplicate skus", payload: duplicateSkusPayload },
  ];

  payloads.forEach((item) => {
    it(`format payload - ${item.title}`, () => {
      expect(transformRequestBody(item.payload)).toEqual(formattedPayload);
    });
  });
});
