import LoggerService from "./logger/logger.service";

export interface StockItem {
  sku: string;
  quantity: number;
}

export interface StockSkus {
  skus: StockItem[];
}

export interface Skus {
  sku: string[];
}

export type HttpHeaders = Record<string, string>;

export interface Event {
  headers: HttpHeaders;
  body: StockSkus;
}

export interface Stock {
  stock: StockItem[];
}

// alaways keep null at the end of this array to avoid use it when test
export const sellerTypes = ["multivende", "centry", null] as const;
export type SellerType = typeof sellerTypes[number];

export type ClientType = "PIM" | "STOCK";

export interface PimPayload extends Skus {
  sellerId: string;
}

export type Logger = Partial<typeof console> & LoggerService;
