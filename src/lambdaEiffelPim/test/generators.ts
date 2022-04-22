import { Event, StockItem, StockSkus } from "../common/types";
import config from "../config";

export function generateRandomInt(maxNumber = 10) {
  return Math.floor(Math.random() * (maxNumber + 1));
}

export function buildSku() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < 10; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `${result}"-${generateRandomInt(9)}`;
}

export function buildRequestBody({
  skusAdded = [] as unknown[],
  skusLength = generateRandomInt(config.maxSkusLength),
} = {}): StockSkus {
  const skus = [] as StockItem[];
  const resultLength = skusLength === 0 ? 1 : skusLength;

  for (let i = 0; i < resultLength; i += 1) {
    const newItem = { sku: buildSku(), quantity: generateRandomInt() };
    const isUniqueItem = skus.every((item) => item.sku !== newItem.sku);

    if (isUniqueItem) skus.push(newItem);
  }

  return { skus: [...skus, ...skusAdded] as StockItem[] };
}

export const buildStockSkus = buildRequestBody;

export function buildEvent({
  jwt = "",
  bodySkusLength = 3 as number,
  ...overrides
} = {}): Event {
  return {
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    body: buildRequestBody({ skusLength: bodySkusLength }),
    ...overrides,
  };
}

export function getFalsyValue() {
  const falsyValues = ["", 0, null, undefined, false];
  const valueIndex = generateRandomInt(falsyValues.length - 1);

  return falsyValues[valueIndex];
}
