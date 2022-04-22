import { StockSkus, StockItem } from "../types";
import config from "../../config";

// Esto puede ser un middleware.
// Evaluar hacer un middleware generico que pueda recibir las validaciones como options
// Pasar las validaciones como { body, query, params } y dentro del md correr de manera condicional solo los que se reciben
// Proponer usar Joi para esto
export function validateRequestBody(input: unknown) {
  const body = input as Partial<StockSkus>;

  if (body?.skus === undefined) throw new Error("The key skus is required");
  if (!Array.isArray(body?.skus))
    throw new Error("The key skus must be an array");
  if (body?.skus?.length === 0)
    throw new Error(`The key skus mustn't be an empty array`);
  if (body?.skus?.length > config.maxSkusLength)
    throw new Error(`The max length of skus is ${config.maxSkusLength}`);

  const invalidItem = body?.skus?.find(
    (v) => !v.sku || Number.isNaN(Number(v.quantity)) || Number(v.quantity) < 0
  );
  if (invalidItem)
    throw new Error(
      `All skus must be an instance of StockItem - Invalid Sku: ${invalidItem.sku}`
    );

  return { skus: body.skus } as StockSkus;
}

export function transformRequestBody(body: StockSkus) {
  // format items and remove duplicates
  const formattedSkus = body.skus.reduce((acc, item) => {
    const isDuplicate = acc.some((accItem) => accItem.sku === item.sku);

    if (isDuplicate) return acc;

    const formattedItem = {
      sku: String(item.sku),
      quantity: Number(item.quantity),
    };

    return [...acc, formattedItem];
  }, [] as StockItem[]);

  return { skus: formattedSkus };
}
